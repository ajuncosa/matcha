import type { CreateSuggestion, ISuggestionRepository } from "@/core/suggestion/ISuggestionRepository";
import type { Suggestion, SuggestionId } from "@/core/suggestion/Suggestion";
import type { UserId } from "@/core/user/User";
import type { Pool } from "pg";

export class SuggestionRepositoryPostgres implements ISuggestionRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async findForUser(userId: UserId): Promise<Suggestion[]> {
        const query = await this.pool.query("SELECT * FROM suggestions WHERE userId=$1", [userId]);
        
        return query.rows.map((row) => {
            return {
                id: row.id,
                userId: row.user_id,
                suggestedUser: row.suggested_user,
                distanceBetween: row.distance_between,
                sharedTagsIds: row.shared_tags_ids
            }
        });
    }

    async create(suggestion: CreateSuggestion): Promise<Suggestion> {
        const query = await this.pool.query(`
            INSERT INTO suggestions(user_id, suggested_user, distance_between, shared_tags_ids)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, [suggestion.userId, suggestion.suggestedUser, suggestion.distanceBetween, suggestion.sharedTagsIds]);

        return {
            id: query.rows[0].id,
            userId: suggestion.userId,
            suggestedUser: suggestion.suggestedUser,
            distanceBetween: suggestion.distanceBetween,
            sharedTagsIds: suggestion.sharedTagsIds
        }
    }

    async createBulk(suggestions: CreateSuggestion[]): Promise<void> {
        if (suggestions.length === 0) return;

        const values = suggestions
            .map((suggestion, index) => {
                const baseIndex = index * 4;
                return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`;
            })
            .join(',');

        const params = suggestions.flatMap(suggestion => [
            suggestion.userId,
            suggestion.suggestedUser,
            suggestion.distanceBetween,
            suggestion.sharedTagsIds
        ]);

        await this.pool.query(`
            INSERT INTO suggestions(user_id, suggested_user, distance_between, shared_tags_ids)
            VALUES ${values}
        `, params);
    }

    async delete(suggestionId: SuggestionId): Promise<void> {
        await this.pool.query(`
            DELETE FROM suggestions
            WHERE id = $1
        `, [suggestionId]);
    }
    
    async deleteBulk(suggestionIds: SuggestionId[]): Promise<void> {
        if (suggestionIds.length === 0) return;

        const placeholders = suggestionIds
            .map((_, index) => `$${index + 1}`)
            .join(',');

        await this.pool.query(`
            DELETE FROM suggestions
            WHERE id IN (${placeholders})
        `, suggestionIds);
    }

    async deleteForUser(userId: UserId): Promise<void> {
        await this.pool.query(`
            DELETE FROM suggestions
            WHERE user_id = $1
        `, [userId]);
    }

}