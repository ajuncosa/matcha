import type { ITagsRepository } from "@/core/tag/ITagsRepository";
import { Tag, type TagId } from "@/core/tag/Tag";
import type { Pool } from "pg";

export class TagRepositoryPostgres implements ITagsRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async findTagById(id: TagId): Promise<Tag | null> {
        const query = await this.pool.query("\
            SELECT * from tags\
            WHERE id=$1",
        [id]);

        if (query.rows.length == 0)
            return null;

        return new Tag(query.rows[0].id, query.rows[0].name);
    }

    async findTagByName(normalizedTagName: string): Promise<Tag | null> {
        const query = await this.pool.query("\
            SELECT * from tags\
            WHERE name=$1",
        [normalizedTagName]);

        if (query.rows.length == 0)
            return null;

        return new Tag(query.rows[0].id, query.rows[0].name);
    }

    async findTagsByName(normalizedTagNames: string[]): Promise<Tag[]> {
        const tags: Tag[] = [];

        for (const t of normalizedTagNames) {
            const tag: Tag | null = await this.findTagByName(t);
            if (tag) tags.push(tag);
        }

        return tags;
    }

    async findTagsBulkById(tagsIds: TagId[]): Promise<Tag[]> {
        if (tagsIds.length === 0) return [];

        const values = tagsIds
            .map((_, index) => {
                return `($${index + 1})`;
            })
            .join(',');

        const params = tagsIds.flatMap(tagId => [
            tagId,
        ]);

        const query = await this.pool.query(`
            SELECT * FROM tags
            WHERE id IN (${values})
        `, params);

        const tags: Tag[] = query.rows.map((row) => {
            return {
                id: row.id,
                name: row.name
            }
        });

        return tags;
    }

    async createTag(tag: string): Promise<Tag> {
        const query = await this.pool.query("\
            INSERT INTO tags(name) VALUES($1)\
            RETURNING id\
        ", [tag]);

        return new Tag(query.rows[0].id, query.rows[0].name);
    }

    async createTags(tags: string[]): Promise<Tag[]> {
        let createdTags: Tag[] = [];

        for (const tag of tags) {
            const createdTag: Tag = await this.createTag(tag);
            createdTags.push(createdTag);
        }

        return createdTags;
    }

    async updateTag(tag: Tag): Promise<Tag> {
        const query = await this.pool.query("\
            UPDATE tags SET name=$2\
            WHERE id=$1\
            RETURNING id, name\
        ", [tag.id, tag.name]);

        return new Tag(query.rows[0].id, query.rows[0].name);
    }

    async updateTags(tags: Tag[]): Promise<Tag[]> {
        let updatedTags: Tag[] = [];

        for (const tag of tags) {
            const updatedTag: Tag = await this.updateTag(tag);
            updatedTags.push(updatedTag);
        }

        return updatedTags;
    }

    async deleteTags(tags: Tag[]): Promise<void> {
        for (const tag of tags) {
            await this.pool.query("\
                DELETE FROM tags WHERE id=$1\
            ", [tag.id]);
        }
    }

}