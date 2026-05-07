import type { Tag, TagId } from "../tag/Tag";
import type { UserId, User } from "../user/User";

export type SuggestionId = number;

export interface SuggestedUser {
    user: Omit<User, "password">;
    commonTags: Tag[];
    distanceBetween: number;
} 

export interface Suggestion {
    id: SuggestionId;
    userId: UserId;
    suggestedUser: UserId;
    distanceBetween: number;
    sharedTagsIds: TagId[];
}