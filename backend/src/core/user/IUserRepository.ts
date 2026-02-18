import { type UserId, User, Email, UserGender, UserSex, UserDetails } from "@/core/user/User";
import type { Tag } from "@/core/tag/Tag";
import type { Photo } from "@/core/photos/Photo";

export interface IUserRepository {
    findUserById(user: UserId): Promise<User | null>;
    findUserByEmail(email: Email): Promise<User | null>;
    createUser(name: string, lastname: string, email: Email, password: string): Promise<void>;
    createUserDetails(userId: UserId, gender: UserGender, sex: UserSex, birthday: Date,
        lat: number, lon: number, preferredGender: UserGender, preferredSex: UserSex,
        preferredMinAge: number, preferredMaxAge: number, biography: string): Promise<void>;
    updateUserDetails(userId: UserId, details: UserDetails): Promise<UserDetails>;

    getUserPhotos(userId: UserId): Promise<Photo[]>;
    addPhotosToUser(userId: UserId, photos: Photo[]): Promise<void>;
    deletePhotosFromUser(userId: UserId, photos: Photo[]): Promise<void>;

    getUserTags(userId: UserId): Promise<Tag[]>;
    addTagsToUser(userId: UserId, tags: Tag[]): Promise<void>;
    deleteTagsFromUser(userId: UserId, tags: Tag[]): Promise<void>;

    setUserLastConnection(userId: UserId): Promise<void>;
}