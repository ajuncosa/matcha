import type { SearchCriteria } from "@/core/search/SearchCriteria";
import type { SearchResult, SearchResultItem } from "@/core/search/SearchResult";
import type { ISearchRepository, IUserSearchData } from "@/core/search/ISearchRepository";
import type { IUserRepository } from "@/core/user/IUserRepository";
import { UserNotFound, type UserId } from "@/core/user/User";
import type { Tag } from "@/core/tag/Tag";
import { Photo } from "@/core/photos/Photo";

export class SearchUseCases {
    private searchRepo: ISearchRepository;
    private userRepo: IUserRepository;

    constructor(searchRepo: ISearchRepository, userRepo: IUserRepository) {
        this.searchRepo = searchRepo;
        this.userRepo = userRepo;
    }

    async search(searcherId: UserId, criteria: SearchCriteria): Promise<SearchResult> {
        const searcher = await this.userRepo.findUserById(searcherId);
        if (!searcher) {
            throw new UserNotFound();
        }

        const searcherTags = searcher.details?.tags || [];

        const { users } = await this.searchRepo.searchUsers(searcherId, criteria);

        let resultItems = users.map((user) => this.mapToSearchResultItem(user, searcherTags, criteria));

        resultItems = this.applyFilters(resultItems, criteria);

        resultItems = this.applySorting(resultItems, criteria);

        const total = resultItems.length;
        const page = criteria.page;
        const limit = criteria.limit;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedItems = resultItems.slice(startIndex, endIndex);

        return {
            items: paginatedItems,
            total,
            page,
            limit,
            hasMore: endIndex < resultItems.length
        };
    }

    private mapToSearchResultItem(
        user: IUserSearchData,
        searcherTags: Tag[],
        criteria: SearchCriteria
    ): SearchResultItem {
        const age = this.calculateAge(user.birthday);
        const distance = criteria.userLat !== undefined && criteria.userLon !== undefined
            ? this.calculateDistance(criteria.userLat, criteria.userLon, user.lat, user.lon)
            : null;
        const commonTagsCount = this.countCommonTags(user.tags, searcherTags);

        const profilePhoto = user.profilePhotoId && user.profilePhotoPath
            ? new Photo(user.profilePhotoId, user.profilePhotoPath)
            : null;

        return {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            age,
            tags: user.tags,
            profilePhoto,
            fameRating: user.fameRating,
            distance,
            commonTagsCount
        };
    }

    private calculateAge(birthday: Date): number {
        const today = new Date();
        let age = today.getFullYear() - birthday.getFullYear();
        const monthDiff = today.getMonth() - birthday.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
            age--;
        }
        return age;
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371;
        const dLat = this.degreesToRadians(lat2 - lat1);
        const dLon = this.degreesToRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    }

    private degreesToRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    private countCommonTags(userTags: Tag[], searcherTags: Tag[]): number {
        const searcherTagIds = new Set(searcherTags.map(t => t.id));
        return userTags.filter(tag => searcherTagIds.has(tag.id)).length;
    }

    private applyFilters(items: SearchResultItem[], criteria: SearchCriteria): SearchResultItem[] {
        return items.filter(item => {
            if (criteria.minAge !== undefined && item.age < criteria.minAge) {
                return false;
            }
            if (criteria.maxAge !== undefined && item.age > criteria.maxAge) {
                return false;
            }

            if (criteria.minFame !== undefined && item.fameRating < criteria.minFame) {
                return false;
            }
            if (criteria.maxFame !== undefined && item.fameRating > criteria.maxFame) {
                return false;
            }

            if (criteria.maxDistance !== undefined && criteria.maxDistance > 0) {
                if (item.distance === null || item.distance > criteria.maxDistance) {
                    return false;
                }
            }

            if (criteria.minCommonTags !== undefined && criteria.minCommonTags > 0) {
                if (item.commonTagsCount < criteria.minCommonTags) {
                    return false;
                }
            }

            if (criteria.tags && criteria.tags.length > 0) {
                const itemTagNames = new Set(item.tags.map(t => t.name.toLowerCase()));
                const hasMatchingTag = criteria.tags.some(tag =>
                    itemTagNames.has(tag.toLowerCase())
                );
                if (!hasMatchingTag) {
                    return false;
                }
            }

            return true;
        });
    }

    private applySorting(items: SearchResultItem[], criteria: SearchCriteria): SearchResultItem[] {
        const multiplier = criteria.sortOrder === "desc" ? -1 : 1;

        switch (criteria.sortBy) {
            case "age":
                return items.sort((a, b) => multiplier * (a.age - b.age));
            case "location":
                return items.sort((a, b) => {
                    const distA = a.distance ?? Infinity;
                    const distB = b.distance ?? Infinity;
                    return multiplier * (distA - distB);
                });
            case "fame-rating":
                return items.sort((a, b) => multiplier * (a.fameRating - b.fameRating));
            case "common-tags":
                return items.sort((a, b) => multiplier * (a.commonTagsCount - b.commonTagsCount));
            case "none":
            default:
                return items;
        }
    }
}
