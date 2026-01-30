import type { Tag, TagId } from "@/core/tag/Tag";

export interface ITagsRepository {
    findTagById(id: TagId): Promise<Tag | null>;
    findTagByName(tag: string): Promise<Tag | null>;
    findTagsByName(normalizedTagNames: string[]): Promise<Tag[]>;
    createTag(tag: string): Promise<Tag>;
    createTags(tags: string[]): Promise<Tag[]>;
    updateTags(tags: Tag[]): Promise<Tag[]>;
    deleteTags(tags: Tag[]): Promise<void>;
};