import { type UserId, User, Email, UserGender, UserSex } from "@/core/user/User";

export interface IUserRepository {
    findUserById(user: UserId): Promise<User | null>;
    findUserByEmail(email: Email): Promise<User | null>;
    createUser(name: string, lastname: string, email: Email, password: string): Promise<void>;
    createUserDetails(userId: UserId, gender: UserGender, sex: UserSex, birthday: Date,
        lat: number, lon: number, preferredGender: UserGender, preferredSex: UserSex,
        preferredMinAge: number, preferredMaxAge: number, biography: string): Promise<void>;
    updateUserDetails(userId: UserId, gender: UserGender | undefined, sex: UserSex | undefined,
        birthday: Date | undefined, lat: number | undefined, lon: number | undefined, preferredGender: UserGender | undefined,
        preferredSex: UserSex | undefined, preferredMinAge: number | undefined, preferredMaxAge: number | undefined,
        biography: string | undefined, fame_rating: number | undefined, last_connection: Date | undefined): Promise<void>;
    createUserTags(tags: string[]): Promise<void>;
    updateUserTags(tags: string[]): Promise<void>;
    createUserPhotos(photos: string[]): Promise<void>;
    updateUserPhotos(photos: string[]): Promise<void>;
}