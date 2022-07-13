export class Member {
    peerId: string;
    userId: string;
    cam: boolean = false;
    mic: boolean = false;

    constructor(peerId: string, userId: string) {
        this.peerId = peerId;
        this.userId = userId;
    }
}