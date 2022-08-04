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
    bot?: boolean;
    speech?: {
        rate: number,
        pitch: number,
        volume: number,
    };

    constructor(data: RegisterMemberData, socketId: string) {
        this.mainPeerId = data.mainPeerId;
        this.userId = data.userId;
        this.name = data.name;
        this.avatar = data.avatar;
        this.socketId = socketId;
        if (data.bot) {
            this.bot = data.bot;
        }
        if (data.speech) {
            this.speech = data.speech;
        }
    }
}

export interface RegisterMemberData {
    mainPeerId: string;
    userId: string;
    name: string;
    avatar: string;
    bot?: boolean;
    speech?: {
        rate: number,
        pitch: number,
        volume: number,
    };
}