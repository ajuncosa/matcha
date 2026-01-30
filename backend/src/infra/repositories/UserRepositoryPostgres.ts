import { Photo } from "@/core/photos/Photo";
import { Tag } from "@/core/tag/Tag";
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
            query.rows[0].lastname,
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

    async updateUserDetails(userId: UserId, details: UserDetails): Promise<UserDetails> {
        const query = await this.pool.query(`
            UPDATE users_details 
            SET gender=$2, sex=$3, biography=$4, lat=$5, lon=$6, 
                preferred_gender=$7, preferred_sex=$8, preferred_min_age=$9, 
                preferred_max_age=$10, fame_rating=$11, 
                birthday=$12, last_connection=$13
            WHERE user_id=$1
            RETURNING gender, sex, biography, lat, lon, preferred_gender, preferred_sex, preferred_min_age, preferred_max_age, fame_rating, birthday, last_connection
        `, [
            userId,              // $1
            details.gender,      // $2  
            details.sex,         // $3
            details.biography,   // $4
            details.lat,         // $5
            details.lon,         // $6
            details.preferredGender, // $7
            details.preferredSex,    // $8
            details.preferredMinAge, // $9
            details.preferredMaxAge, // $10
            details.fameRating,  // $11
            details.birthday,    // $12
            details.lastConnection // $13
        ]);

        return this.constructUserDetails(query)!; // Case where this can return null?
    }

    async getUserPhotos(userId: UserId): Promise<Photo[]>
    {
        const query = await this.pool.query("SELECT photo_id FROM users_photos WHERE user_id=$1", [userId]);

        const photoIds: number[] = query.rows.map((row) => row.photo_id);

        const photosQuery = await this.pool.query(`
            SELECT * FROM photos
            WHERE id=$1
        `, photoIds);
        
        const photos: Photo[] = photosQuery.rows.map((row) => new Photo(row.id, row.file_path));

        return photos;
    }

    async addPhotosToUser(userId: UserId, photos: Photo[]): Promise<void>
    {
        for (const photo of photos) {
            await this.pool.query("\
                INSERT INTO users_photos(user_id, photo_id) VALUES($1, $2)\
            ", [userId, photo.id]);
        }
    }

    async deletePhotosFromUser(userId: UserId, photos: Photo[]): Promise<void>
    {
        for (const photo of photos) {
            await this.pool.query("\
                DELETE FROM users_photos\
                WHERE user_id=$1 AND photo_id=$2\
            ", [userId, photo.id]);
        }
    }

    async getUserTags(userId: UserId): Promise<Tag[]> {
        const userTagsQuery = await this.pool.query(`
            SELECT tag_id FROM users_interests_tags
            WHERE user_id=$1
        `, [userId]);

        const userTagsIds: number[] = userTagsQuery.rows.map((row) => row.tag_id);

        const tagsQuery = await this.pool.query(`
            SELECT * FROM tags
            WHERE tag_id=$1
        `, userTagsIds);
        
        const tags: Tag[] = tagsQuery.rows.map((row) => new Tag(row.id, row.name));

        return tags;
    }

    async addTagsToUser(userId: UserId, tags: Tag[]): Promise<void> {
        for (const tag of tags) {
            await this.pool.query("\
                INSERT INTO users_interests_tags(user_id, tag_id) VALUES($1, $2)\
            ", [userId, tag.id]);
        }
    }

    async deleteTagsFromUser(userId: UserId, tags: Tag[]): Promise<void> {
        for (const tag of tags) {
            await this.pool.query("\
                DELETE FROM users_interests_tags\
                WHERE user_id=$1 AND tag_id=$2\
            ", [userId, tag.id]);
        }
    }
}