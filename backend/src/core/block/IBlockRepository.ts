export interface IBlockRepository {
    block(blockerId: number, blockedId: number): Promise<void>;
    unblock(blockerId: number, blockedId: number): Promise<void>;
    isBlocked(userIdA: number, userIdB: number): Promise<boolean>;
    getBlockedIds(blockerId: number): Promise<number[]>;
    getBlockerIds(userId: number): Promise<number[]>;
}
