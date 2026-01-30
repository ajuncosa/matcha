import type { Tag } from "@/core/tag/Tag";

export interface ITagsService {
    normalizeTagName(tag: string): string;
    normalizeTagsNames(tags: string[]): string[];
    upsertTag(normalizedTagName: string): Promise<Tag>;
    upsertTags(normalizedTagsNames: string[]): Promise<Tag[]>;
}