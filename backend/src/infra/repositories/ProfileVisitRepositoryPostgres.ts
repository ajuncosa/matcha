import type { Pool } from "pg";
import type { IProfileVisitRepository, ProfileVisitorInfo } from "@/core/profileVisit/IProfileVisitRepository";

export class ProfileVisitRepositoryPostgres implements IProfileVisitRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async record(visitorId: number, visitedId: number): Promise<void> {
        await this.pool.query(
            `INSERT INTO profile_visits(visitor_user_id, visited_user_id, created_at)
             VALUES($1, $2, CURRENT_TIMESTAMP)`,
            [visitorId, visitedId]
        );
    }

    async getVisitors(visitedUserId: number): Promise<ProfileVisitorInfo[]> {
        const result = await this.pool.query(
            `SELECT
                u.id,
                u.name,
                u.lastname,
                ph.file_path AS profile_photo_path,
                MAX(pv.created_at) AS last_visited_at
             FROM profile_visits pv
             JOIN users u ON u.id = pv.visitor_user_id
             LEFT JOIN users_details ud ON ud.user_id = pv.visitor_user_id
             LEFT JOIN photos ph ON ph.id = ud.profile_photo_id
             WHERE pv.visited_user_id = $1
             GROUP BY u.id, u.name, u.lastname, ph.file_path
             ORDER BY last_visited_at DESC
             LIMIT 50`,
            [visitedUserId]
        );

        return result.rows.map(row => ({
            id: row.id,
            name: row.name,
            lastname: row.lastname,
            profilePhotoPath: row.profile_photo_path ?? null,
            lastVisitedAt: new Date(row.last_visited_at),
        }));
    }

    async hadVisited(visitorId: number, visitedId: number): Promise<boolean> {
        const result = await this.pool.query(
            `SELECT 1 FROM profile_visits
             WHERE visitor_user_id = $1 AND visited_user_id = $2
             LIMIT 1`,
            [visitorId, visitedId]
        );
        return result.rows.length > 0;
    }
}
