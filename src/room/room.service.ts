import { CreateRoomData, Room, RoomObject, RoomPrev, RoomsList } from "./room.model";
import e from "express";
import { Server, Socket } from "socket.io";
import { ProtocolToClient, ServerMessage, ServerMessageTypes } from "../protocol";
import { v4 as uuid } from 'uuid';
import { Member, RegisterMemberData } from "./member.model";
import { ServerMessageConnectedDto } from "./dto/server-message-connected.dto";
import { ServerMessageDisconnectedDto } from "./dto/server-message-disconnected.dto";
import { ServerMessageRequestKeyDto } from "./dto/server-message-request-key.dto";

const DELETE_ROOM_DELAY = 30000;

export class RoomService {
    private roomsList: RoomsList = new Map<string, Room>();
    private peerServer: e.Express;
    private socketServer: Server<any>;

    constructor(peerServer: e.Express, io: Server<any>) {
        this.peerServer = peerServer;
        this.socketServer = io;
    }

    private sendRooms(): void {
        this.socketServer.emit(ProtocolToClient.ROOMS_LIST, JSON.stringify(this.roomsListToRoomsPrevList(this.roomsList)));
    }

    private sendRoom(roomId: string): void {
        const room: Room | undefined = this.roomsList.get(roomId);
        if (room) {
            this.socketServer.to(roomId).emit(ProtocolToClient.ROOM_DATA, JSON.stringify(RoomService.roomToRoomObject(room)));
        }
    }

    private static serverMessageJSON<T>(data: ServerMessage<T>): string {
        return JSON.stringify(data);
    }

    private roomsListToRoomsPrevList(roomsList: RoomsList): RoomPrev[] {
        return Object.values(Object.fromEntries(roomsList.entries())).map((room: Room) => {
            const obj: RoomPrev = {
                id: room.id,
                name: room.name,
                startTime: room.startTime,
                privateMode: room.privateMode,
                membersCount: room.members.size,
                invites: Array.from(room.invites),
            };
            return obj;
        });
    }

    private static roomToRoomObject(room: Room): RoomObject {
        return {
            id: room.id,
            name: room.name,
            startTime: room.startTime,
            privateMode: room.privateMode,
            key: room.key,
            messages: room.messages,
            members: Object.values(Object.fromEntries(room.members.entries())),
            invites: Array.from(room.invites),
            moderators: Array.from(room.moderators),
        };
    }

    public connectedClient(socket: Socket): void {
        console.log('[Socket server] Connected client');
        socket.emit(ProtocolToClient.ROOMS_LIST, JSON.stringify(this.roomsListToRoomsPrevList(this.roomsList)));
    }

    public joinMember(socket: Socket, roomId: string, data: RegisterMemberData, key: string | null): void {
        const room: Room | undefined = this.roomsList.get(roomId);
        if (room) {
            const join = () => {
                if (room.members.has(data.userId)) {
                    const oldMember: Member | undefined = room.members.get(data.userId);
                    if (oldMember) {
                        const oldSocket: Socket | undefined = this.socketServer.sockets.sockets.get(oldMember.socketId);
                        // room.members.delete(oldMember.userId);
                        if (oldSocket) {
                            oldSocket.emit(ProtocolToClient.SERVER_MESSAGE, RoomService.serverMessageJSON<ServerMessageDisconnectedDto>({
                                code: ServerMessageTypes.DISCONNECTED,
                                message: `You connected from other device.`,
                            }));
                            console.log('[Socket server] disconnected member: ', oldMember.userId);
                            oldSocket.leave(roomId);
                            oldMember.socketId = socket.id;
                            oldMember.mainPeerId = data.mainPeerId;
                            oldMember.sharePeerId = undefined;
                            oldMember.camState = false;
                            oldMember.micState = false;
                            oldMember.screenShare = false;
                            room.members.set(oldMember.userId, oldMember);
                            this.sendRooms();
                            this.sendRoom(roomId);

                        }
                    }
                }
                room.members.set(data.userId, new Member({
                    mainPeerId: data.mainPeerId,
                    userId: data.userId,
                    name: data.name,
                    avatar: data.avatar,
                }, socket.id));
                socket.join(roomId);
                setTimeout(() => {
                    socket.to(roomId).emit(ProtocolToClient.MEMBER_JOINED, JSON.stringify({
                        mainPeerId: data.mainPeerId,
                        userId: data.userId,
                    }));
                    socket.emit(ProtocolToClient.SERVER_MESSAGE, RoomService.serverMessageJSON<ServerMessageConnectedDto>({
                        code: ServerMessageTypes.CONNECTED,
                        message: {
                            roomId: roomId,
                            mainPeerId: data.mainPeerId,
                            userId: data.userId,
                        }
                    }));
                    this.sendRooms();
                    this.sendRoom(roomId);
                    console.log('[Socket server] joined member: ', data.userId);
                }, 100);
            }
            if (room.privateMode) {
                if (room.invites.has(data.userId)) {
                    join();
                } else if (key !== null) {
                    if (key === room.key) {
                        join();
                    } else {
                        socket.emit(ProtocolToClient.SERVER_MESSAGE, RoomService.serverMessageJSON<ServerMessageDisconnectedDto>({
                            code: ServerMessageTypes.DISCONNECTED,
                            message: 'Invalid room key',
                        }));
                    }
                } else {
                    socket.emit(ProtocolToClient.SERVER_MESSAGE, RoomService.serverMessageJSON<ServerMessageRequestKeyDto>({
                        code: ServerMessageTypes.REQUEST_KEY,
                        message: {
                            roomId: roomId,
                            mainPeerId: data.mainPeerId,
                            userId: data.userId,
                        }
                    }));
                }
            } else {
                join();
            }
        }
    }

    public leaveMember(socket: Socket, roomId: string, userId: string): void {
        console.log('[Socket server] leave member: ', userId);
        const room: Room | undefined = this.roomsList.get(roomId);
        if (room) {
            room.members.delete(userId);
            socket.to(roomId).emit(ProtocolToClient.MEMBER_LEFT, userId);
            socket.leave(roomId);
            if (room.members.size === 0) {
                this.deleteRoom(roomId);
            }
            this.sendRooms();
            this.sendRoom(roomId);
        }
    }

    public createRoom(data: CreateRoomData): void {
        console.log('[Socket server] created room: ', data.name);
        const roomId = uuid();
        this.roomsList.set(
            roomId,
            {
                name: data.name,
                id: roomId,
                privateMode: data.privateMode,
                key: data.key || undefined,
                startTime: null,
                messages: [],
                members: new Map<string, Member>(),
                invites: new Set(data.invites),
                moderators: new Set([`${data.owner}`]),
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