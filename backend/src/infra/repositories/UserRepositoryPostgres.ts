import { Photo } from "@/core/photos/Photo";
import { Tag } from "@/core/tag/Tag";
import { type IUserRepository } from "@/core/user/IUserRepository";
import { EmailAddress, User, type UserId, UserDetails, UserGender, getUserGenderFromString, UserSex, getUserSexFromString } from "@/core/user/User";
import type { Pool, QueryResult } from "pg";


export default class UserRepositoryPostgres implements IUserRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    private constructUserDetails(detailsQuery: QueryResult<any>,
        tags: Tag[], photos: Photo[]
    ): UserDetails | null {
        if (detailsQuery.rows.length == 0)
            return null;

        const userGender = getUserGenderFromString(detailsQuery.rows[0].gender);
        const userSex = getUserSexFromString(detailsQuery.rows[0].sex);
        const userPreferredGender = (getUserGenderFromString(detailsQuery.rows[0].preferred_gender) || UserGender.Any) as UserGender;
        const userPreferredSex = (getUserSexFromString(detailsQuery.rows[0].preferred_sex) || UserSex.Any) as UserSex;

        if (!userGender)
            throw Error(`Cannot convert ${detailsQuery.rows[0].gender} to UserGender`);
        if (!userSex)
            throw Error(`Cannot convert ${detailsQuery.rows[0].sex} to UserSex`);

        const profilePhoto = photos.find((p) => p.id == detailsQuery.rows[0].profile_photo_id);
        const userDetails = new UserDetails(
            userGender,
            userSex,
            new Date(detailsQuery.rows[0].birthday),
            detailsQuery.rows[0].lat,
            detailsQuery.rows[0].lon,
            userPreferredGender,
            userPreferredSex,
            detailsQuery.rows[0].preferred_min_age,
            detailsQuery.rows[0].preferred_max_age,
            detailsQuery.rows[0].biography,
            tags,
            photos,
            profilePhoto ?? null
        );
        userDetails.fameRating = detailsQuery.rows[0].fame_rating;
        userDetails.lastConnection = detailsQuery.rows[0].last_connection ? new Date(detailsQuery.rows[0].last_connection) : null;
        return userDetails;
    }

    async findUserById(userId: UserId): Promise<User | null> {
        const userQuery = await this.pool.query("SELECT * FROM users WHERE id=$1", [userId]);
        if (userQuery.rows.length == 0)
            return null;

        let emailValidatedAt = undefined;
        if (userQuery.rows[0].email_validated_at)
            emailValidatedAt = new Date(userQuery.rows[0].email_validated_at);

        const user = new User(
            userQuery.rows[0].id,
            userQuery.rows[0].name,
            userQuery.rows[0].lastname,
            userQuery.rows[0].username ?? "",
            new EmailAddress(userQuery.rows[0].email),
            userQuery.rows[0].password,
            new Date(userQuery.rows[0].created_at),
            emailValidatedAt
        );

        const detailsQuery = await this.pool.query("SELECT * FROM users_details WHERE user_id=$1", [userId]);
        if (detailsQuery.rows.length != 0)
        {
            const tags = await this.getUserTags(userId);
            const photos = await this.getUserPhotos(userId);
            user.details = this.constructUserDetails(detailsQuery, tags, photos);
        }

        return user;
    }

    async findUserByEmail(email: EmailAddress): Promise<User | null> {
        const query = await this.pool.query("SELECT * FROM users WHERE email=$1", [email.value()]);
        if (query.rows.length == 0)
            return null;

        let emailValidatedAt = undefined;
        if (query.rows[0].email_validated_at)
            emailValidatedAt = new Date(query.rows[0].email_validated_at);

        const user = new User(
            query.rows[0].id,
            query.rows[0].name,
            query.rows[0].lastname,
            query.rows[0].username ?? "",
            new EmailAddress(query.rows[0].email),
            query.rows[0].password,
            new Date(query.rows[0].created_at),
            emailValidatedAt
        );

        const detailsQuery = await this.pool.query("SELECT * FROM users_details WHERE user_id=$1", [user.id]);
        if (detailsQuery.rows.length != 0)
        {
            const tags = await this.getUserTags(user.id);
            const photos = await this.getUserPhotos(user.id);
            user.details = this.constructUserDetails(detailsQuery, tags, photos);
        }

        return user;
    }

    async findUserByUsername(username: string): Promise<User | null> {
        const query = await this.pool.query("SELECT * FROM users WHERE username=$1", [username]);
        if (query.rows.length == 0) return null;

        let emailValidatedAt = undefined;
        if (query.rows[0].email_validated_at)
            emailValidatedAt = new Date(query.rows[0].email_validated_at);

        const user = new User(
            query.rows[0].id,
            query.rows[0].name,
            query.rows[0].lastname,
            query.rows[0].username ?? "",
            new EmailAddress(query.rows[0].email),
            query.rows[0].password,
            new Date(query.rows[0].created_at),
            emailValidatedAt
        );

        const detailsQuery = await this.pool.query("SELECT * FROM users_details WHERE user_id=$1", [user.id]);
        if (detailsQuery.rows.length != 0) {
            const tags = await this.getUserTags(user.id);
            const photos = await this.getUserPhotos(user.id);
            user.details = this.constructUserDetails(detailsQuery, tags, photos);
        }

        return user;
    }

    async createUser(name: string, lastname: string, email: EmailAddress, password: string, username: string): Promise<User> {
        const query = await this.pool.query(`INSERT INTO users(name, lastname, email, password, username, created_at)
                        VALUES($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                        RETURNING id, name, lastname, email, password, username, created_at`,
                    [name, lastname, email.value(), password, username]);

        const user = new User(
            query.rows[0].id,
            query.rows[0].name,
            query.rows[0].lastname,
            query.rows[0].username,
            new EmailAddress(query.rows[0].email),
            query.rows[0].password,
            new Date(query.rows[0].created_at)
        );

        return user;
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

    async updateUser(userId: UserId, name: string, lastname: string, email: EmailAddress, password: string): Promise<void>
    {
        const query = await this.pool.query(`
            UPDATE users 
            SET name=$2, lastname=$3, email=$4, password=$5
            WHERE id=$1
            RETURNING name, lastname, email, password
        `, [
            userId,         // $1
            name,           // $2  
            lastname,       // $3
            email.value(),  // $4
            password        // $5
        ]);
    }

    async updateUserDetails(userId: UserId, details: UserDetails): Promise<void> {
        await this.pool.query(`
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
    }

    async getUserPhotos(userId: UserId): Promise<Photo[]>
    {
        const query = await this.pool.query("SELECT photo_id FROM users_photos WHERE user_id=$1", [userId]);

        const photoIds: number[] = query.rows.map((row) => row.photo_id);

        const photosQuery = await this.pool.query(`
            SELECT * FROM photos
            WHERE id = ANY($1)
        `, [photoIds]);
        
        const photos: Photo[] = photosQuery.rows.map((row) => new Photo(row.id, row.file_path));

        return photos;
    }

    async updateUserProfilePhoto(userId: UserId, photo: Photo): Promise<void>
    {
        await this.pool.query(`
            UPDATE users_details
            SET profile_photo_id=$2
            WHERE user_id=$1
        `, [userId, photo.id]);
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
            WHERE id = ANY($1)
        `, [userTagsIds]);
        
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

    async setUserLastConnection(userId: UserId): Promise<void> {
        await this.pool.query(`
            UPDATE users_details 
            SET last_connection=NOW()
            WHERE user_id=$1
        `, [userId]);
    }

    async setEmailToken(userId: UserId, token: string): Promise<void> {
        await this.pool.query(`
            UPDATE users
            SET email_token=$2
            WHERE id=$1
        `, [userId, token]);
    }

    async setEmailValidated(userId: UserId): Promise<void> {
        await this.pool.query(`
            UPDATE users 
            SET email_validated_at=NOW()
            WHERE id=$1
        `, [userId]);
    }

    async getUserByEmailValidationToken(token: string): Promise<User | null> {
        const userQuery = await this.pool.query("SELECT * FROM users WHERE email_token=$1", [token]);
        if (userQuery.rows.length == 0)
            return null;

        let emailValidatedAt = undefined;
        if (userQuery.rows[0].email_validated_at)
            emailValidatedAt = new Date(userQuery.rows[0].email_validated_at);

        const user = new User(
            userQuery.rows[0].id,
            userQuery.rows[0].name,
            userQuery.rows[0].lastname,
            userQuery.rows[0].username ?? "",
            new EmailAddress(userQuery.rows[0].email),
            userQuery.rows[0].password,
            new Date(userQuery.rows[0].created_at),
            emailValidatedAt
        );

        return user;
    }

    async adjustFameRating(userId: UserId, delta: number): Promise<void> {
        await this.pool.query(
            `UPDATE users_details
             SET fame_rating = GREATEST(0, fame_rating + $2)
             WHERE user_id = $1`,
            [userId, delta]
        );
    }

    async setPasswordResetToken(userId: UserId, token: string, expiresAt: Date): Promise<void> {
        await this.pool.query(
            `UPDATE users SET password_reset_token=$2, password_reset_expires_at=$3 WHERE id=$1`,
            [userId, token, expiresAt]
        );
    }

    async getUserByPasswordResetToken(token: string): Promise<User | null> {
        const query = await this.pool.query(
            "SELECT * FROM users WHERE password_reset_token=$1 AND password_reset_expires_at > NOW()",
            [token]
        );
        if (query.rows.length == 0) return null;

        let emailValidatedAt = undefined;
        if (query.rows[0].email_validated_at)
            emailValidatedAt = new Date(query.rows[0].email_validated_at);

        return new User(
            query.rows[0].id,
            query.rows[0].name,
            query.rows[0].lastname,
            query.rows[0].username ?? "",
            new EmailAddress(query.rows[0].email),
            query.rows[0].password,
            new Date(query.rows[0].created_at),
            emailValidatedAt
        );
    }

    async clearPasswordResetToken(userId: UserId): Promise<void> {
        await this.pool.query(
            `UPDATE users SET password_reset_token=NULL, password_reset_expires_at=NULL WHERE id=$1`,
            [userId]
        );
    }

    async updatePassword(userId: UserId, hashedPassword: string): Promise<void> {
        await this.pool.query(
            `UPDATE users SET password=$2 WHERE id=$1`,
            [userId, hashedPassword]
        );
    }

    async getUsersInArea(minLat: number, maxLat: number, minLon: number, maxLon: number): Promise<User[]> {
        const query = await this.pool.query(`
            SELECT u.*, ud.*
            FROM users as u
            JOIN users_details as ud
            ON u.id = ud.user_id
            WHERE 
                ud.lat BETWEEN $1 AND $2 
                AND ud.lon BETWEEN $3 AND $4
        `, [minLat, maxLat, minLon, maxLon]);

        const users: User[] = [];
        for (const row of query.rows) {
            let emailValidatedAt = undefined;
            if (row.email_validated_at)
                emailValidatedAt = new Date(row.email_validated_at);

            const user = new User(
                row.id,
                row.name,
                row.lastname,
                row.username ?? "",
                new EmailAddress(row.email),
                row.password,
                new Date(row.created_at),
                emailValidatedAt
            );

            const tags = await this.getUserTags(row.id);
            const photos = await this.getUserPhotos(row.id);
            const detailsQuery = { rows: [row] } as QueryResult<any>;
            user.details = this.constructUserDetails(detailsQuery, tags, photos);

            users.push(user);
        }

        return users;
    }
}