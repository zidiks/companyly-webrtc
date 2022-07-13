import express, { Express } from "express";
import dotenv from 'dotenv';
import { ExpressPeerServer } from 'peer';
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { ProtocolToServer, SocketProtocol } from "./protocol";
import { RoomService } from "./room/room.service";

dotenv.config();

const portSocket = process.env.SOCKET_PORT;
const portPeer = process.env.PEER_PORT;

const appSocket: Express = express();
const appPeer: Express = express();
const serverSocket = createServer(appSocket);
const serverPeer = createServer(appPeer);
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

    socket.on(ProtocolToServer.join, (roomId: string, peerId: string, userId: string) => {
        roomService.joinMember(socket, roomId, peerId, userId);
    });

    socket.on(ProtocolToServer.leave, (roomId: string, userId: string) => {
        roomService.leaveMember(socket, roomId, userId);
    });

    socket.on(ProtocolToServer.create, (name: string, privateMode: boolean) => {
        roomService.createRoom(name, privateMode);
    });
});

serverSocket.listen(portSocket);
serverPeer.listen(portPeer);



