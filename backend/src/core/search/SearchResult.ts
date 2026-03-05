import type { Photo } from "@/core/photos/Photo";
import type { Tag } from "@/core/tag/Tag";
import type { UserId } from "@/core/user/User";

export interface SearchResultItem {
    id: UserId;
    name: string;
    lastname: string;
    age: number;
    tags: Tag[];
    profilePhoto: Photo | null;
    fameRating: number;
    distance: number | null;
    commonTagsCount: number;
}

export interface SearchResult {
    items: SearchResultItem[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
