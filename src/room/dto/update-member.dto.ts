export interface UpdateMemberDto  {
    userId: string;
    camState?: boolean;
    micState?: boolean;
    screenShare?: boolean;
    sharePeerId?: string;
}