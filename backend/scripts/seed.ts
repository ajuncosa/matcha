import { Client } from "pg";
import * as bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { mkdir } from "node:fs/promises";
import PlatformPath from "node:path";

// --- Photo seeding config ---
// IMAGES_DIR is relative to the app root (cwd when running `bun run seed`), which
// matches how the server serves them: express.static('images') -> /api/images/<file>.
const IMAGES_DIR = "images";
const PHOTOS_PER_USER_MIN = 3;
const PHOTOS_PER_USER_MAX = 5;
// Image resolution. Portrait 4:5 for the gallery photos; a large square for avatars.
const MIN_PHOTO_WIDTH = 940;
const MIN_PHOTO_HEIGHT = 800;
const MAX_PHOTO_WIDTH = 1240;
const MAX_PHOTO_HEIGHT = 1800;

const AVATAR_SIZE = 512;

// Interests are a *shared vocabulary*: users need overlapping tags for matching and
// suggestions to work, so this stays a controlled pool (unlike the free-text fields,
// which now come from faker for maximum variety).
const tagNames = [
    "hiking", "coffee", "reading", "music", "gaming", "foodie", "fitness", "yoga",
    "travel", "dogs", "cats", "art", "photography", "beach", "movies", "cooking",
    "tech", "volunteering", "meditation", "sports", "beer", "dancing", "vinyl", "diving",
    "podcasts", "pottery", "languages", "climbing", "comedy", "sustainability",
    "wine", "running", "gardening", "startups", "fashion", "writing", "painting",
    "skiing", "surfing", "cycling", "karaoke", "brunch", "tattoos", "astrology",
    "chess", "board-games", "hockey", "basketball", "soccer", "tennis"
];

// Madrid centre, used as the origin to scatter users around.
const MADRID: [number, number] = [40.4168, -3.7038];

interface CompatibleProfile {
    gender: string;
    sex: string;
    preferredGender: string;
    preferredSex: string;
}

function generateCompatibleProfile(): CompatibleProfile {
    const r = Math.random();
    if (r < 0.45) {
        // Straight man
        return { gender: "man", sex: "male", preferredGender: "woman", preferredSex: "female" };
    } else if (r < 0.90) {
        // Straight woman
        return { gender: "woman", sex: "female", preferredGender: "man", preferredSex: "male" };
    } else {
        // Non-binary / open preferences (matches anyone with "any" prefs)
        return { gender: "non_binary", sex: "intersex", preferredGender: "any", preferredSex: "any" };
    }
}

interface SeedUser {
    name: string;
    lastname: string;
    email: string;
    username: string;
    password: string;
    gender: string;
    sex: string;
    preferredGender: string;
    preferredSex: string;
    preferredMinAge: number;
    preferredMaxAge: number;
    lat: number;
    lon: number;
    biography: string;
    fameRating: number;
    birthday: Date;
    tags: string[];
}

function generateUsers(count: number): SeedUser[] {
    const users: SeedUser[] = [];

    for (let i = 0; i < count; i++) {
        const profile = generateCompatibleProfile();
        // Bias faker's name generation to the profile's sex where it maps cleanly.
        const fakerSex = profile.sex === "male" ? "male" : profile.sex === "female" ? "female" : undefined;
        const name = faker.person.firstName(fakerSex);
        const lastname = faker.person.lastName(fakerSex);

        const [lat, lon] = faker.location.nearbyGPSCoordinate({ origin: MADRID, radius: 15, isMetric: true });

        const preferredMinAge = faker.number.int({ min: 18, max: 30 });
        const preferredMaxAge = faker.number.int({ min: preferredMinAge + 5, max: 75 });

        users.push({
            name,
            lastname,
            // email has no unique constraint, so faker variety is fine as-is.
            email: faker.internet.email({ firstName: name, lastName: lastname }).toLowerCase(),
            // username IS unique in the DB -> append the index to guarantee uniqueness.
            username: (faker.internet.username({ firstName: name, lastName: lastname }) + i).toLowerCase().slice(0, 50),
            password: "password123",
            gender: profile.gender,
            sex: profile.sex,
            preferredGender: profile.preferredGender,
            preferredSex: profile.preferredSex,
            preferredMinAge,
            preferredMaxAge,
            lat: Math.round(lat * 10000) / 10000,
            lon: Math.round(lon * 10000) / 10000,
            biography: faker.person.bio(),
            fameRating: faker.number.int({ min: 0, max: 100 }),
            birthday: faker.date.birthdate({ min: 18, max: 60, mode: "age" }),
            tags: faker.helpers.arrayElements(tagNames, { min: 2, max: 6 }),
        });
    }

    return users;
}

async function seedTags(client: Client): Promise<Map<string, number>> {
    const tagMap = new Map<string, number>();

    for (const tagName of tagNames) {
        const existingResult = await client.query("SELECT id FROM tags WHERE name = $1", [tagName]);
        if (existingResult.rows.length > 0) {
            tagMap.set(tagName, existingResult.rows[0].id);
        } else {
            const result = await client.query("INSERT INTO tags(name) VALUES($1) RETURNING id", [tagName]);
            tagMap.set(tagName, result.rows[0].id);
        }
    }

    console.log(`Seeded ${tagNames.length} tags`);
    return tagMap;
}

async function seedUsers(client: Client, count: number, tagMap: Map<string, number>): Promise<number[]> {
    const users = generateUsers(count);
    const userIds: number[] = [];
    let seededCount = 0;

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        const userResult = await client.query(
            `INSERT INTO users(name, lastname, email, email_validated_at, password, username, created_at)
             VALUES($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, CURRENT_TIMESTAMP)
             RETURNING id`,
            [user.name, user.lastname, user.email, hashedPassword, user.username]
        );

        const userId = userResult.rows[0].id;
        userIds.push(userId);

        await client.query(
            `INSERT INTO users_details(user_id, gender, sex, preferred_gender, preferred_sex,
             preferred_min_age, preferred_max_age, lat, lon, biography, fame_rating,
             birthday, last_connection)
             VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)`,
            [
                userId,
                user.gender,
                user.sex,
                user.preferredGender,
                user.preferredSex,
                user.preferredMinAge,
                user.preferredMaxAge,
                user.lat,
                user.lon,
                user.biography,
                user.fameRating,
                user.birthday,
            ]
        );

        for (const tagName of user.tags) {
            const tagId = tagMap.get(tagName);
            if (tagId) {
                await client.query(
                    "INSERT INTO users_interests_tags(user_id, tag_id) VALUES($1, $2)",
                    [userId, tagId]
                );
            }
        }

        seededCount++;
        if (seededCount % 10 === 0) {
            console.log(`Seeded ${seededCount}/${count} users...`);
        }
    }

    console.log(`Successfully seeded ${seededCount} users`);
    return userIds;
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (matcha-seed)" },
            redirect: "follow",
        });
        if (!res.ok) return false;
        // Guard against endpoints that answer 200 with an HTML page: only save
        // genuine image responses (never HTML-as-.jpg).
        const contentType = res.headers.get("content-type") ?? "";
        if (!contentType.startsWith("image/")) return false;
        await Bun.write(destPath, res);
        return true;
    } catch {
        return false;
    }
}

// faker's avatar URLs (GitHub) default to a small size; request a larger one via
// the `s` (size) query param for a higher-resolution profile photo.
function highResAvatarUrl(): string {
    const url = new URL(faker.image.personPortrait());
    url.searchParams.set("s", String(AVATAR_SIZE));
    return url.toString();
}

// Downloads 3-5 images per user (a faker avatar as the profile photo + random
// real photos), stores them on disk and links them in the DB. Runs OUTSIDE the
// main transaction because it is network-bound and slow.
async function seedUserPhotos(client: Client, userIds: number[]): Promise<void> {
    await mkdir(IMAGES_DIR, { recursive: true });
    let usersDone = 0;
    let photoCount = 0;

    for (const userId of userIds) {
        const n = faker.number.int({ min: PHOTOS_PER_USER_MIN, max: PHOTOS_PER_USER_MAX });
        let profilePhotoId: number | null = null;

        for (let i = 0; i < n; i++) {
            const fileName = `seed-${userId}-${i}-${Date.now()}.jpg`;
            const destPath = PlatformPath.join(IMAGES_DIR, fileName);
            const width = faker.number.int({min: MIN_PHOTO_WIDTH, max: MAX_PHOTO_WIDTH});
            const height = faker.number.int({min: MIN_PHOTO_HEIGHT, max: MAX_PHOTO_HEIGHT});

            // Profile photo (i === 0) = faker avatar URL; the rest = random real photos.
            const url = i === 0
                ? highResAvatarUrl()
                : faker.image.urlPicsumPhotos({ width: width, height: height, blur: 0 });

            let ok = await downloadImage(url, destPath);
            // Fallback so the profile photo is never missing if the avatar host fails.

            if (!ok && i === 0)
                ok = await downloadImage(faker.image.urlPicsumPhotos({ width: width, height: height, blur: 0 }), destPath);
            if (!ok) continue;

            const photoRes = await client.query(
                "INSERT INTO photos(file_path) VALUES($1) RETURNING id",
                [fileName]
            );
            const photoId = photoRes.rows[0].id as number;
            await client.query(
                "INSERT INTO users_photos(user_id, photo_id) VALUES($1, $2)",
                [userId, photoId]
            );
            if (profilePhotoId === null) profilePhotoId = photoId;
            photoCount++;
        }

        if (profilePhotoId !== null) {
            await client.query(
                "UPDATE users_details SET profile_photo_id=$1 WHERE user_id=$2",
                [profilePhotoId, userId]
            );
        }

        usersDone++;
        if (usersDone % 10 === 0) {
            console.log(`Seeded photos for ${usersDone}/${userIds.length} users (${photoCount} images so far)...`);
        }
    }

    console.log(`Seeded ${photoCount} photos across ${userIds.length} users`);
}

async function main() {
    const args = process.argv.slice(2);
    const userCount = parseInt(args[0] ?? "") || 50;

    console.log(`Starting database seeding with ${userCount} users...`);

    const client = new Client();

    try {
        await client.connect();
        console.log("Connected to database");

        // Seed tags + users in one transaction (fast, no network I/O).
        await client.query("BEGIN");
        const tagMap = await seedTags(client);
        const userIds = await seedUsers(client, userCount, tagMap);
        await client.query("COMMIT");

        // Seed photos separately: network-bound and slow, so it runs on
        // auto-committed statements rather than holding the transaction open.
        console.log("\nDownloading and linking profile photos (this can take a while)...");
        await seedUserPhotos(client, userIds);

        console.log("\nDatabase seeding completed successfully!");
        console.log(`Created:`);
        console.log(`  - ${userCount} users (${PHOTOS_PER_USER_MIN}-${PHOTOS_PER_USER_MAX} photos each)`);
        console.log(`  - ${tagNames.length} tags`);
        console.log(`All users have password: "password123"`);
    } catch (error) {
        try { await client.query("ROLLBACK"); } catch { /* no active tx */ }
        console.error("Error seeding database:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
