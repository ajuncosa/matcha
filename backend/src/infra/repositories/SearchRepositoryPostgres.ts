import type { ISearchRepository, IUserSearchData } from "@/core/search/ISearchRepository";
import type { SearchCriteria } from "@/core/search/SearchCriteria";
import { Tag } from "@/core/tag/Tag";
import type { UserId } from "@/core/user/User";
import type { Pool } from "pg";

export default class SearchRepositoryPostgres implements ISearchRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async searchUsers(
        searcherId: UserId,
        criteria: SearchCriteria
    ): Promise<{ users: IUserSearchData[]; total: number }> {
        const conditions: string[] = ["u.id != $1"];
        const params: (string | number)[] = [searcherId];
        let paramIndex = 2;

        if (criteria.searchText) {
            conditions.push(`(LOWER(u.name) LIKE LOWER($${paramIndex}) OR LOWER(u.lastname) LIKE LOWER($${paramIndex}))`);
            params.push(`%${criteria.searchText}%`);
            paramIndex++;
        }

        if (criteria.minFame !== undefined) {
            conditions.push(`ud.fame_rating >= $${paramIndex}`);
            params.push(criteria.minFame);
            paramIndex++;
        }

        if (criteria.maxFame !== undefined) {
            conditions.push(`ud.fame_rating <= $${paramIndex}`);
            params.push(criteria.maxFame);
            paramIndex++;
        }

        if (criteria.tags && criteria.tags.length > 0) {
            const tagPlaceholders = criteria.tags.map(() => `$${paramIndex++}`).join(",");
            conditions.push(`EXISTS (
                SELECT 1 FROM users_interests_tags uit2
                JOIN tags t2 ON t2.id = uit2.tag_id
                WHERE uit2.user_id = u.id AND LOWER(t2.name) IN (${tagPlaceholders})
            )`);
            params.push(...criteria.tags.map(t => t.toLowerCase()));
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const query = `
            SELECT 
                u.id,
                u.name,
                u.lastname,
                ud.birthday,
                ud.fame_rating,
                ud.lat,
                ud.lon,
                ud.profile_photo_id,
                p.file_path as profile_photo_path
            FROM users u
            JOIN users_details ud ON ud.user_id = u.id
            LEFT JOIN photos p ON p.id = ud.profile_photo_id
            ${whereClause}
            ORDER BY u.id
        `;

        const result = await this.pool.query(query, params);

        console.log(result);

        const users: IUserSearchData[] = [];
        for (const row of result.rows) {
            const tags = await this.getUserTags(row.id);
            users.push({
                id: row.id,
                name: row.name,
                lastname: row.lastname,
                birthday: new Date(row.birthday),
                tags,
                profilePhotoId: row.profile_photo_id,
                profilePhotoPath: row.profile_photo_path,
                fameRating: row.fame_rating,
                lat: parseFloat(row.lat),
                lon: parseFloat(row.lon)
            });
        }

        return { users, total: users.length };
    }

    private async getUserTags(userId: UserId): Promise<Tag[]> {
        const query = await this.pool.query(`
            SELECT t.id, t.name
            FROM tags t
            JOIN users_interests_tags uit ON uit.tag_id = t.id
            WHERE uit.user_id = $1
        `, [userId]);

        return query.rows.map(row => new Tag(row.id, row.name));
    }
}
