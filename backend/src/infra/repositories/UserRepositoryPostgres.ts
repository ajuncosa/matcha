import { type IUserRepository } from "@/core/user/IUserRepository";
import { Email, User, type UserId, UserDetails, UserGender, getUserGenderFromString, UserSex, getUserSexFromString } from "@/core/user/User";
import type { Pool, QueryResult } from "pg";


export default class UserRepositoryPostgres implements IUserRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    private constructUserDetails(detailsQuery: QueryResult<any>): UserDetails | null {
        if (detailsQuery.rows.length == 0)
            return null;

        const userGender: UserGender | null = getUserGenderFromString(detailsQuery.rows[0].gender);
        const userPreferredGender: UserGender | null = getUserGenderFromString(detailsQuery.rows[0].preferred_gender);
        const userSex: UserSex | null = getUserSexFromString(detailsQuery.rows[0].sex);
        const userPreferredSex: UserSex | null = getUserSexFromString(detailsQuery.rows[0].preferred_sex);

        if (!userGender)
            throw Error(`Cannot convert ${detailsQuery.rows[0].gender} to UserGender`);

        if (!userPreferredGender)
            throw Error(`Cannot convert ${detailsQuery.rows[0].preferred_gender} to UserGender`);

        if (!userSex)
            throw Error(`Cannot convert ${detailsQuery.rows[0].sex} to UserSex`);

        if (!userPreferredSex)
            throw Error(`Cannot convert ${detailsQuery.rows[0].preferred_sex} to UserSex`);


        return new UserDetails(
            userGender,
            userSex,
            new Date(detailsQuery.rows[0].date),
            detailsQuery.rows[0].lat,
            detailsQuery.rows[0].lon,
            userPreferredGender,
            userPreferredSex,
            detailsQuery.rows[0].preferred_min_age,
            detailsQuery.rows[0].preferred_max_age,
            detailsQuery.rows[0].biography,
            detailsQuery.rows[0].tags,
            detailsQuery.rows[0].photos
        );
    }

    async findUserById(userId: UserId): Promise<User | null> {
        const userQuery = await this.pool.query("SELECT * FROM users WHERE id=$1", [userId]);
        if (userQuery.rows.length == 0)
            return null;

        const user = new User(
            userQuery.rows[0].id,
            userQuery.rows[0].name,
            userQuery.rows[0].lastname,
            new Email(userQuery.rows[0].email),
            userQuery.rows[0].password,
            new Date(userQuery.rows[0].created_at)
        );

        const detailsQuery = await this.pool.query("SELECT * FROM users_details WHERE user_id=$1", [userId]);
        if (detailsQuery.rows.length != 0)
            user.details = this.constructUserDetails(detailsQuery);

        return user;
    }

    async findUserByEmail(email: Email): Promise<User | null> {
        const query = await this.pool.query("SELECT * FROM users WHERE email=$1", [email.value()]);
        if (query.rows.length == 0)
            return null;

        const user = new User(
            query.rows[0].id,
            query.rows[0].name,
            query.rows[0].lastName,
            new Email(query.rows[0].email),
            query.rows[0].password,
            new Date(query.rows[0].created_at)
        );

        const detailsQuery = await this.pool.query("SELECT * FROM users_details WHERE user_id=$1", [user.id]);
        if (detailsQuery.rows.length != 0)
            user.details = this.constructUserDetails(detailsQuery);

        return user;
    }

    async createUser(name: string, lastname: string, email: Email, password: string): Promise<void> {
        await this.pool.query("INSERT INTO users(name, lastname, email, password, created_at) \
                        VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP)",
                    [name, lastname, email.value(), password]);
    }

    async createUserDetails(userId: UserId, gender: UserGender, sex: UserSex, birthday: Date,
        lat: number, lon: number, preferredGender: UserGender, preferredSex: UserSex,
        preferredMinAge: number, preferredMaxAge: number, biography: string): Promise<void>
    {
        await this.pool.query("INSERT INTO users_details(user_id, gender, sex, preferred_gender, \
                preferred_sex, preferred_min_age, preferred_max_age, lat, lon, biography, fame_rating, \
                birthday, last_connection) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
            [userId, gender, sex, preferredGender, preferredSex, preferredMinAge, preferredMaxAge,
                lat, lon, biography, 0, birthday, null]
        );
    }

    async updateUserDetails(userId: UserId, gender: UserGender | undefined, sex: UserSex | undefined,
        birthday: Date | undefined, lat: number | undefined, lon: number | undefined, preferredGender: UserGender | undefined,
        preferredSex: UserSex | undefined, preferredMinAge: number | undefined, preferredMaxAge: number | undefined,
        biography: string | undefined, fame_rating: number | undefined, last_connection: Date | undefined): Promise<void>
    {
        // TODO: implement update only of defined values
    }

    async createUserTags(tags: string[]): Promise<void>
    {
        // TODO: implement
    }

    async createUserPhotos(photos: string[]): Promise<void>
    {
        // TODO: implement
    }

    async updateUserTags(tags: string[]): Promise<void>
    {
        // TODO: implement
    }

    async updateUserPhotos(photos: string[]): Promise<void>
    {
        // TODO: implement
    }
}