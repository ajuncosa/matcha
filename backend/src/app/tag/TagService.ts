import type { ITagsRepository } from "@/core/tag/ITagsRepository";
import type { Tag } from "@/core/tag/Tag";
import type { ITagsService } from "@/core/tag/TagsService";

export class TagService implements ITagsService {
    tagsRepo: ITagsRepository;

    constructor(tagsRepo: ITagsRepository) {
        this.tagsRepo = tagsRepo;
    }

    // Remove spaces and substitute them with '-'
    // "Helo  world      with spaces" => "hello-world-with-spaces"
    normalizeTagName(tag: string): string {
        return tag.replace(/\s+/g, "-").toLowerCase();
    }

    normalizeTagsNames(tags: string[]): string[] {
        return tags.map(t => this.normalizeTagName(t));
    }

    async upsertTag(normalizedTagName: string): Promise<Tag> {
        const tag: Tag | null = await this.tagsRepo.findTagByName(normalizedTagName);
        if (tag) return tag;

        return await this.tagsRepo.createTag(normalizedTagName);
    }

    async upsertTags(normalizedTagsNames: string[]): Promise<Tag[]> {
        const updatedTags: Tag[] = [];
        
        for (const tag of normalizedTagsNames) {
            const upsertTag: Tag = await this.upsertTag(tag);
            updatedTags.push(upsertTag);
        }

        return updatedTags;
    }
}