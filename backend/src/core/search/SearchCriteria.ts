export interface SearchCriteria {
    searchText?: string;
    minAge?: number;
    maxAge?: number;
    minFame?: number;
    maxFame?: number;
    userLat?: number;
    userLon?: number;
    maxDistance?: number;
    tags?: string[];
    minCommonTags?: number;
    sortBy: "age" | "location" | "fame-rating" | "common-tags" | "none";
    sortOrder: "asc" | "desc";
    page: number;
    limit: number;
}
