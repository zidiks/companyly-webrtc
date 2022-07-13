import { Member } from "./member.model";

export interface Room {
    name: string,
    id: string;
    members: Map<string, Member>;
    privateMode: boolean;
}

export type RoomsList = Map<string, Room>;

export interface RoomObject {
    name: string,
    id: string;
    members: Member[];
    privateMode: boolean;
}