import type { CreateSuggestion, ISuggestionRepository } from "../../core/suggestion/ISuggestionRepository";
import type { SuggestedUser, Suggestion } from "../../core/suggestion/Suggestion";
import type { IUserRepository } from "../../core/user/IUserRepository";
import type { User, UserId } from "../../core/user/User";
import { UserGender, UserSex } from "../../core/user/User";
import type { Tag } from "../../core/tag/Tag";
import { isAwaitKeyword } from "typescript";
import type { ITagsRepository } from "@/core/tag/ITagsRepository";

interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export class SuggestionService {

    private userRepository: IUserRepository;
    private suggestionRepository: ISuggestionRepository;
    private tagRepository: ITagsRepository;

    constructor(userRepository: IUserRepository, suggestionRepository: ISuggestionRepository, tagRepository: ITagsRepository) {
        this.userRepository = userRepository;
        this.suggestionRepository = suggestionRepository;
        this.tagRepository = tagRepository;
    }

    /**
     *  Create a box around the (lat,lon) point with a radius of X kms
     */
    private calculateBoundingBox(lat: number, lon: number, radiusKm: number): BoundingBox {
        const halfSquareKm = radiusKm;
        
        // 1 degree of latitude ≈ 111.32 km
        const kmPerDegreeLat = 111.32;
        const latOffset = halfSquareKm / kmPerDegreeLat;
        
        const minLat = lat - latOffset;
        const maxLat = lat + latOffset;
        
        const latRad = (lat * Math.PI) / 180;
        const kmPerDegreeLon = kmPerDegreeLat * Math.cos(latRad);
        const lonOffset = halfSquareKm / kmPerDegreeLon;
        
        const minLon = lon - lonOffset;
        const maxLon = lon + lonOffset;
        
        return {
            minLat,
            maxLat,
            minLon,
            maxLon,
        };
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Check if user1 is compatible with user2's preferences
     */
    private isGenderPreferenceMatch(user1: User, user2: User): boolean {
        if (!user1.details || !user2.details) return false;

        const user1Gender = user1.details.gender;
        const user1Sex = user1.details.sex;
        const user2PreferredGender = user2.details.preferredGender;
        const user2PreferredSex = user2.details.preferredSex;

        // Check gender preference
        const genderMatches = 
            user2PreferredGender === UserGender.Any ||
            user2PreferredGender === user1Gender;

        // Check sex preference
        const sexMatches = 
            user2PreferredSex === UserSex.Any ||
            user2PreferredSex === user1Sex;

        return genderMatches && sexMatches;
    }

    /**
     * Determine user's effective orientation based on their preferences
     */
    private getEffectiveOrientation(user: User): { 
        preferredGenders: UserGender[]; 
        preferredSexes: UserSex[] 
    } {
        if (!user.details) {
            return { 
                preferredGenders: [UserGender.Man, UserGender.Woman, UserGender.NonBinary, UserGender.Other], 
                preferredSexes: [UserSex.Male, UserSex.Female, UserSex.Intersex] 
            };
        }

        const preferredGender = user.details.preferredGender;
        const preferredSex = user.details.preferredSex;

        // If both preferences are "any", treat as bisexual (both genders)
        if (preferredGender === UserGender.Any && preferredSex === UserSex.Any) {
            return { 
                preferredGenders: [UserGender.Man, UserGender.Woman], 
                preferredSexes: [UserSex.Male, UserSex.Female] 
            };
        }

        // If only one preference is specified, we need to infer
        const preferredGenders: UserGender[] = [];
        const preferredSexes: UserSex[] = [];

        if (preferredGender !== UserGender.Any) {
            preferredGenders.push(preferredGender);
        } else {
            // If gender preference is any, include all genders
            preferredGenders.push(UserGender.Man, UserGender.Woman, UserGender.NonBinary, UserGender.Other);
        }

        if (preferredSex !== UserSex.Any) {
            preferredSexes.push(preferredSex);
        } else {
            // If sex preference is any, include all sexes
            preferredSexes.push(UserSex.Male, UserSex.Female, UserSex.Intersex);
        }

        return { preferredGenders, preferredSexes };
    }

    /**
     * Check if two users match based on orientation
     */
    private isOrientationMatch(user1: User, user2: User): boolean {
        if (!user1.details || !user2.details) return false;

        // Check if user1 matches user2's preferences
        const matchesUser2Prefs = this.isGenderPreferenceMatch(user1, user2);
        
        // Check if user2 matches user1's preferences
        const matchesUser1Prefs = this.isGenderPreferenceMatch(user2, user1);

        return matchesUser2Prefs && matchesUser1Prefs;
    }

    /**
     * Check if user is within age preferences
     */
    private isAgeMatch(user1: User, user2: User): boolean {
        if (!user1.details || !user2.details) return false;

        const age = this.calculateAge(user2.details.birthday);
        const minAge = user1.details.preferredMinAge;
        const maxAge = user1.details.preferredMaxAge;

        return age >= minAge && age <= maxAge;
    }

    /**
     * Calculate age from birthday
     */
    private calculateAge(birthday: Date): number {
        const today = new Date();
        let age = today.getFullYear() - birthday.getFullYear();
        const monthDiff = today.getMonth() - birthday.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
            age--;
        }
        
        return age;
    }

    /**
     * Calculate shared tags between two users
     */
    private getSharedTags(user1: User, user2: User): Tag[] {
        if (!user1.details || !user2.details) return [];

        const user1Tags = user1.details.tags;
        const user2Tags = user2.details.tags;
        
        return user1Tags.filter(tag1 => 
            user2Tags.some(tag2 => tag2.id === tag1.id)
        );
    }

    /**
     *  Deletes all the current suggestions and generates new suggestions for the user 
     */
    async generateSuggestions(userId: UserId): Promise<CreateSuggestion[]> {
        await this.suggestionRepository.deleteForUser(userId);
        const user: User | null = await this.userRepository.findUserById(userId);
        if (!user || !user.details) return [];

        const positionBoundingBox: BoundingBox = this.calculateBoundingBox(Number(user.details.lat), Number(user.details.lon), 50);
        const usersInBoundingBox: User[] = await this.userRepository.getUsersInArea(
            positionBoundingBox.minLat,
            positionBoundingBox.maxLat,
            positionBoundingBox.minLon,
            positionBoundingBox.maxLon
        );

        const suggestions: CreateSuggestion[] = [];

        for (const potentialUser of usersInBoundingBox) {
            if (potentialUser.id === user.id) continue;
            if (!potentialUser.details) continue;
            if (!this.isOrientationMatch(user, potentialUser)) continue;
            if (!this.isAgeMatch(user, potentialUser)) continue;

            const distance = this.calculateDistance(
                Number(user.details.lat),
                Number(user.details.lon),
                Number(potentialUser.details.lat),
                Number(potentialUser.details.lon)
            );

            const sharedTags = this.getSharedTags(user, potentialUser);
            const sharedTagsIds = sharedTags.map(tag => tag.id);

            suggestions.push({
                userId: user.id,
                suggestedUser: potentialUser.id,
                distanceBetween: Math.round(distance * 10) / 10,
                sharedTagsIds: sharedTagsIds
            });
        }

        if (suggestions.length > 0) {
            await this.suggestionRepository.createBulk(suggestions);
        }

        return suggestions;
    }

    /**
     * Helper to get fame rating for a user from the list
     */
    private getUserFameRating(userId: UserId, users: User[]): number {
        const user = users.find(u => u.id === userId);
        return user?.details?.fameRating ?? 0;
    }

    public async getUserSuggestions(userId: UserId): Promise<SuggestedUser[]> {
        const suggestions: Suggestion[] = await this.suggestionRepository.findForUser(userId);
        const suggestedUsers: SuggestedUser[] = [];

        for (const suggestion of suggestions) {
            const user: User | null = await this.userRepository.findUserById(suggestion.suggestedUser)
            if (user == null) continue;
            const {password, ...restOfUser} = user;


            const tags: Tag[] = await this.tagRepository.findTagsBulkById(suggestion.sharedTagsIds);
            const suggestedUser: SuggestedUser = {
                user: {...restOfUser},
                commonTags: tags,
                distanceBetween: suggestion.distanceBetween
            };
            
            suggestedUsers.push(suggestedUser);
        }
        
        return suggestedUsers;
    }


}