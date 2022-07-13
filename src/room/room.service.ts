import { Room, RoomObject, RoomsList } from "./room.model";
import e from "express";
import { Server, Socket } from "socket.io";
import { ProtocolErrors, ProtocolToClient } from "../protocol";
import { v4 as uuid } from 'uuid';
import { Member } from "./member.model";

const DELETE_ROOM_DELAY = 5000;

export class RoomService {
    private roomsList: RoomsList = new Map<string, Room>();
    private peerServer: e.Express;
    private socketServer: Server<any>;

    constructor(peerServer: e.Express, io: Server<any>) {
        this.peerServer = peerServer;
        this.socketServer = io;
        this.init();
    }

    private sendRooms(): void {
        this.socketServer.emit(ProtocolToClient.rooms, JSON.stringify(this.roomsToObject(this.roomsList)));
    }

    private init(): void {
        // this.peerServer.on(PeerProtocol.connection, res => {
        //     // console.log('[Peer server] connected client: ', res);
        // })
    }

    private roomsToObject(roomsList: RoomsList): RoomObject[] {
        return Object.values(Object.fromEntries(roomsList.entries())).map((room: Room) => {
            const obj = {
                name: room.name,
                id: room.id,
                privateMode: room.privateMode,
                members: Object.values(Object.fromEntries(room.members.entries())),
            };
            return obj;
        });
    }

    public connectedClient(socket: Socket): void {
        console.log('[Socket server] Connected client');
        socket.emit(ProtocolToClient.rooms, JSON.stringify(this.roomsToObject(this.roomsList)));
    }

    public joinMember(socket: Socket, roomId: string, peerId: string, userId: string): void {
        const room: Room | undefined = this.roomsList.get(roomId);
        if (room) {
            if (room.members.has(userId)) {
                socket.emit(ProtocolToClient.error, ProtocolErrors.userExists, `User with id=${userId} already connected`);
            } else {
                room.members.set(userId, new Member(peerId, userId));
                socket.join(roomId);
                setTimeout(() => {
                    socket.to(roomId).emit(ProtocolToClient.connected, JSON.stringify({
                        peerId,
                        userId,
                    }));
                    this.sendRooms();
                    console.log('[Socket server] joined member: ', userId);
                }, 100);
            }
        }
    }

    public leaveMember(socket: Socket, roomId: string, userId: string): void {
        console.log('[Socket server] leave member: ', userId);
        const room: Room | undefined = this.roomsList.get(roomId);
        if (room) {
            room.members.delete(userId);
            socket.leave(roomId);
            socket.to(roomId).emit(ProtocolToClient.disconnected, userId);
            if (room.members.size === 0) {
                this.deleteRoom(roomId);
            }
            this.sendRooms();
        }
    }

    public createRoom(name: string, privateMode: boolean): void {
        console.log('[Socket server] created room: ', name);
        const roomId = uuid();
        this.roomsList.set(
            roomId,
            {
                name,
                id: roomId,
                privateMode,
                members: new Map<string, Member>(),
            }
        );
        this.sendRooms();
    }

    public deleteRoom(roomId: string): void {
        const room: Room | undefined = this.roomsList.get(roomId);
        if (room) {
            console.log(`[Socket server] delete  room in ${DELETE_ROOM_DELAY}ms: `, room.name);
            setTimeout(() => {
                if (room.members.size === 0) {
                    this.roomsList.delete(roomId);
                    this.sendRooms();
                }
            }, DELETE_ROOM_DELAY);
        }
    }
}