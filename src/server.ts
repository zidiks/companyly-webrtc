import express, { Express } from "express";
import dotenv from 'dotenv';
import { ExpressPeerServer } from 'peer';
import { createServer as createServerHttps } from "https";
import { createServer as createServerHttp } from "http";
import { Server, Socket } from "socket.io";
import { ProtocolToServer, SocketProtocol } from "./protocol";
import { RoomService } from "./room/room.service";
import cors  from "cors";
import fs from "fs";
import { RegisterMemberData } from "./room/member.model";
import { CreateRoomData } from "./room/room.model";
import { Message } from "./room/message.model";
import { NewMessageDto } from "./room/dto/new-message.dto";
import { UpdateMemberDto } from "./room/dto/update-member.dto";

dotenv.config();

const portSocket = process.env.SOCKET_PORT;
const portPeer = process.env.PEER_PORT;

const appSocket: Express = express();
appSocket.use(cors());
const appPeer: Express = express();
appPeer.use(cors());

const dev: boolean = process.env.npm_lifecycle_script === 'nodemon';

if (dev) {
    console.log('Running in dev mode');
}

const serverSocket = dev ? createServerHttp(appSocket) : createServerHttps({
    key: fs.readFileSync('/etc/letsencrypt/live/clikl.ru/privkey.pem', 'utf8'),
    cert: fs.readFileSync('/etc/letsencrypt/live/clikl.ru/cert.pem', 'utf8'),
}, appSocket);

const serverPeer = dev ? createServerHttp(appPeer) : createServerHttps({
    key: fs.readFileSync('/etc/letsencrypt/live/clikl.ru/privkey.pem', 'utf8'),
    cert: fs.readFileSync('/etc/letsencrypt/live/clikl.ru/cert.pem', 'utf8'),
}, appPeer);

const peerServer = ExpressPeerServer(serverPeer);
const io = new Server(serverSocket, {
    cors: {
        origin: '*',
    },
});

appPeer.use('/', peerServer);

const roomService = new RoomService(peerServer, io);

io.on(SocketProtocol.connection, (socket: Socket) => {
    roomService.connectedClient(socket);

    socket.on('disconnect', function(){
        roomService.disconnectedSocket(socket);
    });

    socket.on(ProtocolToServer.JOIN_MEMBER, (roomId: string, data: string, key?: string) => {
        try {
            const objData: RegisterMemberData = JSON.parse(data) as RegisterMemberData;
            roomService.joinMember(socket, roomId, objData, key || null);
        } catch (e) {
            console.log(e);
        }
    });

    socket.on(ProtocolToServer.LEAVE_MEMBER, (roomId: string, userId: string) => {
        roomService.leaveMember(socket, roomId, userId);
    });

    socket.on(ProtocolToServer.UPDATE_MEMBER, (roomId: string, data: string) => {
        try {
            const objData: UpdateMemberDto = JSON.parse(data) as UpdateMemberDto;
            roomService.updateMember(socket, roomId, objData);
        } catch (e) {
            console.log(e);
        }
    });

    socket.on(ProtocolToServer.ASSISTANT_NEW_VOICE, (roomId: string, message: string) => {
       roomService.newAssistantVoice(socket, roomId, message);
    });

    socket.on(ProtocolToServer.FOR_ASSISTANT_VOICE, (roomId: string, message: string) => {
        roomService.newUserVoice(socket, roomId, message);
    });

    socket.on(ProtocolToServer.CREATE_ROOM, (data: string) => {
        try {
            const objData: CreateRoomData = JSON.parse(data) as CreateRoomData;
            roomService.createRoom(objData);
        } catch (e) {
            console.log(e);
        }
    });

    socket.on(ProtocolToServer.NEW_MESSAGE, (data: string, roomId: string) => {
       try {
           const objData: NewMessageDto = JSON.parse(data) as NewMessageDto;
           roomService.newMessage(objData, roomId);
       } catch (e) {
           console.log(e);
       }
    });


});

serverSocket.listen(portSocket, () => {
    console.log(`Socket server listening at port:${portSocket}`);
});
serverPeer.listen(portPeer, () => {
    console.log(`Peer server listening at port:${portPeer}`);
});



