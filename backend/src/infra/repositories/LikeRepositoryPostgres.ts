import type { ILikeRepository } from "@/core/like/ILikeRepository";
import type { Like } from "@/core/like/Like";
import type { UserId } from "@/core/user/User";
import type { Pool } from "pg";

export class LikeRepositoryPostgres implements ILikeRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }
    
    async getUserConnections(userId: UserId): Promise<Like[]> {
        const query = await this.pool.query(`
            SELECT DISTINCT 
                p1.id,
                p2.liker_user_id as user2_id
            FROM profile_likes p1
            JOIN profile_likes p2 ON p1.liker_user_id = p2.liked_user_id 
                AND p1.liked_user_id = p2.liker_user_id
            WHERE p1.liker_user_id = $1::bigint 
                AND p1.liked_user_id != $1::bigint
                AND p2.id != p1.id;`,
        [userId]);
        
        return query.rows.map((like) => ({
            id: like.id,
            liker: userId,
            liked: Number(like.user2_id),
        }));
    }

}