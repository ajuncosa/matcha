import { type UserId, User, Email } from "@/core/user/User";

export interface IUserRepository {
    findUserById(user: UserId): User;
    findUserByEmail(user: Email): User;
    createUser(user: User): void;
}