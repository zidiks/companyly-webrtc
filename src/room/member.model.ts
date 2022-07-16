export class Member {
    mainPeerId: string;
    sharePeerId?: string;
    userId: string;
    socketId: string;
    name: string;
    avatar: string;
    camState: boolean = false;
    micState: boolean = false;
    screenShare: boolean = false;

    constructor(data: RegisterMemberData, socketId: string) {
        this.mainPeerId = data.mainPeerId;
        this.userId = data.userId;
        this.name = data.name;
        this.avatar = data.avatar;
        this.socketId = socketId;
    }
}

export interface RegisterMemberData {
    mainPeerId: string;
    userId: string;
    name: string;
    avatar: string;
}