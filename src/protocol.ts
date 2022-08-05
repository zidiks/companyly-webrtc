export enum ProtocolToClient {
    MEMBER_JOINED = 'member-joined',
    MEMBER_LEFT = 'member-left',
    SHARE_JOINED = 'share-joined',
    SHARE_LEFT = 'share-left',
    MESSAGES_LIST = 'messages-list',
    ROOMS_LIST = 'rooms-list',
    ROOM_DATA = 'room-data',
    SERVER_MESSAGE = 'system-message',
    ASSISTANT_VOICE = 'assistant-voice',
    FROM_USER_VOICE = 'from-user-voice',
    INVITED_ASSISTANT = 'invited-assistant',
    KICKED_ASSISTANT = 'kicked-assistant',
}

export enum ProtocolToServer {
    JOIN_MEMBER = 'join-member',
    LEAVE_MEMBER = 'leave-member',
    UPDATE_MEMBER = 'update-member',
    CREATE_ROOM = 'create-room',
    DELETE_ROOM = 'delete-room',
    UPDATE_ROOM = 'update-room',
    NEW_MESSAGE = 'new-message',
    ASSISTANT_NEW_VOICE = 'assistant-new-voice',
    FOR_ASSISTANT_VOICE = 'for-assistant-voice',
    INVITE_ASSISTANT = 'invite-assistant',
    KICK_ASSISTANT = 'kick-assistant',
}

export enum ServerMessageTypes {
    ERROR = 'ERROR',
    REQUEST_KEY = 'REQUEST_KEY',
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    NOTIFICATION = 'NOTIFICATION',
}

export interface ServerMessage<T> {
    code: ServerMessageTypes;
    message: T;
}

export enum SocketProtocol {
    connection = 'connection',
    disconnect = 'disconnect',
}

export enum PeerProtocol {
    connection = 'connection',
}

