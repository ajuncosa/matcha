import type { Suggestion, SuggestionId } from "./Suggestion";
import type { User, UserId } from "../user/User";

export type CreateSuggestion = Omit<Suggestion, 'id'>;

export interface ISuggestionRepository {
    findForUser(userId: UserId) : Promise<Suggestion[]>;
    create(suggestion: CreateSuggestion) : Promise<Suggestion>;
    createBulk(suggestions: CreateSuggestion[]) : Promise<void>;
    delete(suggestionId: SuggestionId) : Promise<void>;
    deleteBulk(suggestionIds: SuggestionId[]): Promise<void>;
    deleteForUser(userId: UserId): Promise<void>;
}