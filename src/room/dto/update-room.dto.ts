export interface UpdateRoomDto {
    name: string;
    privateMode: boolean;
    invites: string[];
    moderators: string[];
}