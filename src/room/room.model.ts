import { Member } from "./member.model";
import { Message } from "./message.model";

export interface Room {
    id: string;
    name: string;
    startTime: number | null;
    privateMode: boolean;
    key?: string;
    messages: Message[];
    members: Map<string, Member>;
    invites: Set<string>;
    moderators: Set<string>;
}

export type RoomsList = Map<string, Room>;

export interface RoomObject {
    id: string;
    name: string;
    startTime: number | null;
    privateMode: boolean;
    key?: string;
    members: Member[];
    invites: string[];
    moderators: string[];
}

export interface RoomPrev {
    id: string;
    name: string;
    startTime: number | null;
    privateMode: boolean;
    membersCount: number;
    invites: string[];
}

export interface CreateRoomData {
    owner: string;
    name: string;
    privateMode: boolean;
    key?: string;
    invites: string[];
}

export interface updateRoomData {
    name: string;
    privateMode: boolean;
    invites: string[];
    moderators: string[];
}