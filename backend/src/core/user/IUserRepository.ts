import { type UserId, User, Email, UserGender, UserSex, UserDetails } from "@/core/user/User";
import type { Tag } from "@/core/tag/Tag";

export interface IUserRepository {
    findUserById(user: UserId): Promise<User | null>;
    findUserByEmail(email: Email): Promise<User | null>;
    createUser(name: string, lastname: string, email: Email, password: string): Promise<void>;
    createUserDetails(userId: UserId, gender: UserGender, sex: UserSex, birthday: Date,
        lat: number, lon: number, preferredGender: UserGender, preferredSex: UserSex,
        preferredMinAge: number, preferredMaxAge: number, biography: string): Promise<void>;
    updateUserDetails(userId: UserId, details: UserDetails): Promise<UserDetails>;
    createUserPhotos(photos: string[]): Promise<void>;
    updateUserPhotos(photos: string[]): Promise<void>;
    getUserTags(userId: UserId): Promise<Tag[]>;
    addTagsToUser(userId: UserId, tags: Tag[]): Promise<void>;
    deleteTagsFromUser(userId: UserId, tags: Tag[]): Promise<void>;
}