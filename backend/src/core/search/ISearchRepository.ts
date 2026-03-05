import type { SearchCriteria } from "@/core/search/SearchCriteria";
import type { SearchResult, SearchResultItem } from "@/core/search/SearchResult";
import type { Tag } from "@/core/tag/Tag";
import type { UserId } from "@/core/user/User";

export interface IUserSearchData {
    id: UserId;
    name: string;
    lastname: string;
    birthday: Date;
    tags: Tag[];
    profilePhotoId: number | null;
    profilePhotoPath: string | null;
    fameRating: number;
    lat: number;
    lon: number;
}

export interface ISearchRepository {
    searchUsers(
        searcherId: UserId,
        criteria: SearchCriteria
    ): Promise<{ users: IUserSearchData[]; total: number }>;
}
