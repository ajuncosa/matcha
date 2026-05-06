import type { Tag, TagId } from "../tag/Tag";
import type { UserId } from "../user/User";

export type SuggestionId = number;

export interface Suggestion {
    id: SuggestionId;
    userId: UserId;
    suggestedUser: UserId;
    distanceBetween: number;
    sharedTagsIds: TagId[];
}