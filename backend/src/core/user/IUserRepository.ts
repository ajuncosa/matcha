import { type UserId, User, Email } from "@/core/user/User";

export interface IUserRepository {
    findUserById(user: UserId): Promise<User | null>;
    findUserByEmail(email: Email): Promise<User | null>;
    createUser(name: string, lastname: string, email: Email, password: string): Promise<void>;
}