export interface SearchRequestDto {
    q?: string;
    minAge?: number;
    maxAge?: number;
    minFame?: number;
    maxFame?: number;
    lat?: number;
    lon?: number;
    maxDistance?: number;
    tags?: string;
    minCommonTags?: number;
    sortBy?: "age" | "location" | "fame-rating" | "common-tags" | "none";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
}

export interface SearchResultItemDto {
    id: number;
    name: string;
    lastname: string;
    age: number;
    tags: { id: number; name: string }[];
    profilePhoto: { id: number; filePath: string } | null;
    fameRating: number;
    distance: number | null;
    commonTags: { id: number; name: string }[];
    commonTagsCount: number;
}

export interface SearchResponseDto {
    items: SearchResultItemDto[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
