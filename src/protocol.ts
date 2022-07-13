export enum ProtocolToClient {
    connected = 'user-connected',
    disconnected = 'user-disconnected',
    rooms = 'rooms-list',
    error = 'error',
}

export enum ProtocolErrors {
    userExists = '0',
}

export enum ProtocolToServer {
    join = 'join-room',
    leave = 'leave-room',
    create = 'create-room',
}

export enum SocketProtocol {
    connection = 'connection',
}

export enum PeerProtocol {
    connection = 'connection',
}

