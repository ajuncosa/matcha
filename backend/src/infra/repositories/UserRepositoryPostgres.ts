import { type IUserRepository } from "@/core/user/IUserRepository";
import type { Email, User, UserId } from "@/core/user/User";

export default class UserRepositoryPostgres implements IUserRepository {
    findUserById(user: UserId): User {

    }

    findUserByEmail(user: Email): User {

    }

    createUser(user: User): void {
        
    }
}