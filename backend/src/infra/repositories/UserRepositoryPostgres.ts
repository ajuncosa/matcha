import { type IUserRepository } from "@/core/user/IUserRepository";
import { Email, User, type UserId } from "@/core/user/User";
import type { Pool } from "pg";


export default class UserRepositoryPostgres implements IUserRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async findUserById(userId: UserId): Promise<User | null> {
        const query = await this.pool.query("SELECT * FROM users WHERE id=$1", [userId]);
        if (query.rows.length == 0)
            return null;

        return new User(
            query.rows[0].id,
            query.rows[0].name,
            query.rows[0].lastName,
            new Email(query.rows[0].email),
            query.rows[0].password,
            new Date(query.rows[0].created_at)
        )
    }

    async findUserByEmail(email: Email): Promise<User | null> {
        const query = await this.pool.query("SELECT * FROM users WHERE email=$1", [email.value()]);
        if (query.rows.length == 0)
            return null;

        return new User(
            query.rows[0].id,
            query.rows[0].name,
            query.rows[0].lastName,
            new Email(query.rows[0].email),
            query.rows[0].password,
            new Date(query.rows[0].created_at)
        )
    }

    async createUser(name: string, lastname: string, email: Email, password: string): Promise<void> {
        const query = await this.pool.query("INSERT INTO users(name, lastname, email, password, created_at) \
                        VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP)",
                    [name, lastname, email.value(), password]);
    }
}