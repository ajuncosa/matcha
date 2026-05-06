import type { SearchRequestDto, SearchResponseDto, SearchResultItemDto } from "@/app/search/SearchDto";
import type { SearchUseCases } from "@/app/search/SearchUseCases";
import type { SearchCriteria } from "@/core/search/SearchCriteria";
import type { SearchResultItem } from "@/core/search/SearchResult";
import { UserNotFound } from "@/core/user/User";
import type { Request, Response } from "express";
import MatchaRouter from "./MatchaRouter";

export default class SearchRouter extends MatchaRouter {
    private searchUseCases: SearchUseCases;

    constructor(searchUseCases: SearchUseCases) {
        super();
        this.searchUseCases = searchUseCases;
        this.router.get("/", (req, res) => this.search(req, res));
        this.router.get("/recommendations", (req, res) => this.recommendations(req, res));
    }

    async search(req: Request, res: Response) {
        const dto: SearchRequestDto = {
            q: req.query.q as string | undefined,
            minAge: req.query.minAge ? parseInt(req.query.minAge as string) : undefined,
            maxAge: req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined,
            minFame: req.query.minFame ? parseInt(req.query.minFame as string) : undefined,
            maxFame: req.query.maxFame ? parseInt(req.query.maxFame as string) : undefined,
            lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
            lon: req.query.lon ? parseFloat(req.query.lon as string) : undefined,
            maxDistance: req.query.maxDistance ? parseInt(req.query.maxDistance as string) : undefined,
            tags: req.query.tags as string | undefined,
            minCommonTags: req.query.minCommonTags ? parseInt(req.query.minCommonTags as string) : undefined,
            sortBy: req.query.sortBy as "age" | "location" | "fame-rating" | "common-tags" | "none" | undefined,
            sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 20
        };

        try {
            const criteria: SearchCriteria = {
                searchText: dto.q,
                minAge: dto.minAge,
                maxAge: dto.maxAge,
                minFame: dto.minFame,
                maxFame: dto.maxFame,
                userLat: dto.lat,
                userLon: dto.lon,
                maxDistance: dto.maxDistance,
                tags: dto.tags ? dto.tags.split(/\s+/).filter(t => t.length > 0) : undefined,
                minCommonTags: dto.minCommonTags,
                sortBy: dto.sortBy ?? "none",
                sortOrder: dto.sortOrder ?? "asc",
                page: dto.page ?? 1,
                limit: dto.limit ?? 20
            };

            const result = await this.searchUseCases.search(req.session.userId!, criteria);

            const responseDto: SearchResponseDto = {
                items: result.items.map(item => this.mapToDto(item)),
                total: result.total,
                page: result.page,
                limit: result.limit,
                hasMore: result.hasMore
            };

            res.status(200).json(responseDto);
        } catch (e) {
            if (e instanceof UserNotFound) {
                res.status(401).send(`User with ID \"${req.session.userId}\" was not found`);
                return;
            }
            throw e;
        }
    }

    private mapToDto(item: SearchResultItem): SearchResultItemDto {
        return {
            id: item.id,
            name: item.name,
            lastname: item.lastname,
            age: item.age,
            tags: item.tags.map(tag => ({ id: tag.id, name: tag.name })),
            profilePhoto: item.profilePhoto
                ? { id: item.profilePhoto.id, filePath: item.profilePhoto.filePath }
                : null,
            fameRating: item.fameRating,
            distance: item.distance,
            commonTagsCount: item.commonTagsCount
        };
    }

    async recommendations(req: Request, res: Response) {
        const userId: number | null = req.session.userId ?? null;
        
        if (!userId) {
            res.status(404).send("User not found");
            return;
        }

        this.searchUseCases.recommendations(userId);
        res.status(200).send();
    }
}
