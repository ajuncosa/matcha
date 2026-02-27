import { type UserId, User, EmailAddress, UserGender, UserSex, UserDetails } from "@/core/user/User";
import type { Tag } from "@/core/tag/Tag";
import type { Photo } from "@/core/photos/Photo";

export interface IUserRepository {
    findUserById(user: UserId): Promise<User | null>;
    findUserByEmail(email: EmailAddress): Promise<User | null>;
    createUser(name: string, lastname: string, email: EmailAddress, password: string): Promise<User>;
    createUserDetails(userId: UserId, gender: UserGender, sex: UserSex, birthday: Date,
        lat: number, lon: number, preferredGender: UserGender, preferredSex: UserSex,
        preferredMinAge: number, preferredMaxAge: number, biography: string): Promise<void>;
    updateUserDetails(userId: UserId, details: UserDetails): Promise<void>;

    getUserPhotos(userId: UserId): Promise<Photo[]>;
    updateUserProfilePhoto(userId: UserId, photo: Photo): Promise<void>;
    addPhotosToUser(userId: UserId, photos: Photo[]): Promise<void>;
    deletePhotosFromUser(userId: UserId, photos: Photo[]): Promise<void>;

    getUserTags(userId: UserId): Promise<Tag[]>;
    addTagsToUser(userId: UserId, tags: Tag[]): Promise<void>;
    deleteTagsFromUser(userId: UserId, tags: Tag[]): Promise<void>;

    setUserLastConnection(userId: UserId): Promise<void>;

    setEmailToken(userId: UserId, token: string): Promise<void>;
    setEmailValidated(userId: UserId): Promise<void>;
    getUserByEmailValidationToken(token: string): Promise<User | null>;
}