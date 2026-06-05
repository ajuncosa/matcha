import type { IBlockRepository } from "@/core/block/IBlockRepository";
import type { Pool } from "pg";

export class BlockRepositoryPostgres implements IBlockRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async block(blockerId: number, blockedId: number): Promise<void> {
        await this.pool.query(
            `INSERT INTO blocked_users(blocker_user_id, blocked_user_id)
             SELECT $1, $2
             WHERE NOT EXISTS (
                 SELECT 1 FROM blocked_users
                 WHERE blocker_user_id = $1 AND blocked_user_id = $2
             )`,
            [blockerId, blockedId]
        );
    }

    async unblock(blockerId: number, blockedId: number): Promise<void> {
        await this.pool.query(
            `DELETE FROM blocked_users
             WHERE blocker_user_id = $1 AND blocked_user_id = $2`,
            [blockerId, blockedId]
        );
    }

    async isBlocked(userIdA: number, userIdB: number): Promise<boolean> {
        const result = await this.pool.query(
            `SELECT 1 FROM blocked_users
             WHERE (blocker_user_id = $1 AND blocked_user_id = $2)
                OR (blocker_user_id = $2 AND blocked_user_id = $1)
             LIMIT 1`,
            [userIdA, userIdB]
        );
        return result.rows.length > 0;
    }

    async getBlockedIds(blockerId: number): Promise<number[]> {
        const result = await this.pool.query(
            `SELECT blocked_user_id FROM blocked_users WHERE blocker_user_id = $1`,
            [blockerId]
        );
        return result.rows.map(r => Number(r.blocked_user_id));
    }

    async getBlockerIds(userId: number): Promise<number[]> {
        const result = await this.pool.query(
            `SELECT blocker_user_id FROM blocked_users WHERE blocked_user_id = $1`,
            [userId]
        );
        return result.rows.map(r => Number(r.blocker_user_id));
    }
}
