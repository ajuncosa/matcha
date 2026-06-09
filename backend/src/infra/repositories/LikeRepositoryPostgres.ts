import type { ILikeRepository, LikerInfo } from "@/core/like/ILikeRepository";
import type { Like, LikePair } from "@/core/like/Like";
import type { UserId } from "@/core/user/User";
import type { Pool } from "pg";

export class LikeRepositoryPostgres implements ILikeRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async find(producerId: UserId, targetId: UserId): Promise<LikePair> {
        const producerQuery = await this.pool.query(`
            SELECT id, liker_user_id, liked_user_id, created_at
            FROM profile_likes
            WHERE liker_user_id=$1 AND liked_user_id=$2
            `,
        [producerId, targetId]);

        const targetQuery = await this.pool.query(`
            SELECT id, liker_user_id, liked_user_id, created_at
            FROM profile_likes
            WHERE liker_user_id=$2 AND liked_user_id=$1
            `,
        [producerId, targetId]);

        const likeFromProducerToTarget: boolean = producerQuery.rows.length > 0;
        const likeFromTargetToProducer: boolean = targetQuery.rows.length > 0;

        return [
            likeFromProducerToTarget ? {
              id: producerQuery.rows[0].id,
              liker: producerId,
              liked: targetId,
              createdAt: producerQuery.rows[0].created_at,
            } : null,
            likeFromTargetToProducer ? {
              id: targetQuery.rows[0].id,
              liker: producerId,
              liked: targetId,
              createdAt: targetQuery.rows[0].created_at,
            } : null,
        ];

    }

    async create(producerId: UserId, targetId: UserId): Promise<Like> {
        const query = await this.pool.query(`
            INSERT INTO profile_likes(liker_user_id, liked_user_id, created_at)
            VALUES($1, $2, CURRENT_TIMESTAMP)
            RETURNING id, created_at`,
        [producerId, targetId]);
        
        return {
            id: query.rows[0].id,
            liker: producerId,
            liked: targetId,
            createdAt: new Date(query.rows[0].created_at)
        }
    }

    async delete(producerId: UserId, targetId: UserId): Promise<void> {
        await this.pool.query(`
            DELETE FROM profile_likes
            WHERE liker_user_id=$1 AND liked_user_id=$2`,
        [producerId, targetId]);
    } 

    async getUserConnections(userId: UserId): Promise<Like[]> {
        const query = await this.pool.query(`
            SELECT DISTINCT
                p1.id, p1.created_at,
                p2.liker_user_id as user2_id
            FROM profile_likes p1
            JOIN profile_likes p2 ON p1.liker_user_id = p2.liked_user_id
                AND p1.liked_user_id = p2.liker_user_id
            LEFT JOIN blocked_users bu ON
                (bu.blocker_user_id = $1 AND bu.blocked_user_id = p2.liker_user_id) OR
                (bu.blocker_user_id = p2.liker_user_id AND bu.blocked_user_id = $1)
            WHERE p1.liker_user_id = $1::bigint
                AND p1.liked_user_id != $1::bigint
                AND p2.id != p1.id
                AND bu.id IS NULL;`,
        [userId]);
        
        return query.rows.map((like) => ({
            id: like.id,
            liker: userId,
            liked: Number(like.user2_id),
            createdAt: like.created_at
        }));
    }

    async getLikers(userId: UserId): Promise<LikerInfo[]> {
        const query = await this.pool.query(`
            SELECT u.id, u.name, u.lastname,
                   ph.file_path AS profile_photo_path,
                   l.created_at AS liked_at
            FROM profile_likes l
            JOIN users u ON u.id = l.liker_user_id
            LEFT JOIN users_details ud ON ud.user_id = l.liker_user_id
            LEFT JOIN photos ph ON ph.id = ud.profile_photo_id
            WHERE l.liked_user_id = $1
            ORDER BY l.created_at DESC`,
        [userId]);

        return query.rows.map(row => ({
            id: row.id,
            name: row.name,
            lastname: row.lastname,
            profilePhotoPath: row.profile_photo_path ?? null,
            likedAt: new Date(row.liked_at),
        }));
    }

}