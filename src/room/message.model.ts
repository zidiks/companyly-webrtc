export interface Message {
    type: MessageTypes;
    userId?: string;
    name?: string;
    avatar?: string;
    text: string;
    sendTime: number;
}

export enum MessageTypes {
    USER = 'USER',
    SYSTEM = 'SYSTEM',
}