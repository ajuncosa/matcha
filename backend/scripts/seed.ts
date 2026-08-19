import { Client } from "pg";
import * as bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { mkdir, unlink } from "node:fs/promises";
import PlatformPath from "node:path";

// Set by Ctrl+C so the photo download stops cleanly between users (letting a
// re-run resume from where it left off).
let stopRequested = false;

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

function generateUsers(count: number, indexOffset = 0): SeedUser[] {
    const users: SeedUser[] = [];

    for (let i = indexOffset; i < indexOffset + count; i++) {
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

async function seedUsers(client: Client, count: number, tagMap: Map<string, number>, indexOffset = 0): Promise<number[]> {
    const users = generateUsers(count, indexOffset);
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

// Removes any photos already linked to a user (files + rows). Used to wipe a
// partially-downloaded user (one interrupted mid-batch, so profile_photo_id is
// still NULL) before re-downloading, keeping resumes clean.
async function clearUserPhotos(client: Client, userId: number): Promise<void> {
    const res = await client.query(
        "SELECT p.id AS id, p.file_path AS file_path FROM users_photos up JOIN photos p ON p.id = up.photo_id WHERE up.user_id = $1",
        [userId]
    );
    if (res.rows.length === 0) return;
    for (const row of res.rows) {
        await unlink(PlatformPath.join(IMAGES_DIR, row.file_path)).catch(() => {});
    }
    await client.query("DELETE FROM users_photos WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM photos WHERE id = ANY($1::int[])", [res.rows.map((r) => r.id as number)]);
}

// Downloads 3-5 images per user (a faker avatar as the profile photo + random
// real photos), stores them on disk and links them in the DB. Runs OUTSIDE the
// main transaction (each user is auto-committed) so it can be interrupted and
// resumed: a user is "done" only once its profile_photo_id is set.
async function seedUserPhotos(client: Client, userIds: number[]): Promise<void> {
    await mkdir(IMAGES_DIR, { recursive: true });
    let usersDone = 0;
    let photoCount = 0;

    for (const userId of userIds) {
        if (stopRequested) {
            console.log(`Stopping — ${userIds.length - usersDone} user(s) still need photos. Re-run to resume.`);
            break;
        }

        // Start this user's batch from a clean slate (handles a prior partial run).
        await clearUserPhotos(client, userId);

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

    console.log(`Seeded ${photoCount} photos across ${usersDone} user(s) this run.`);
}

async function main() {
    const args = process.argv.slice(2);
    const userCount = parseInt(args[0] ?? "") || 500;

    console.log(`Seeding target: ${userCount} users.`);

    // Ctrl+C: request a clean stop between users so a re-run resumes cleanly.
    // A second Ctrl+C force-quits.
    process.on("SIGINT", () => {
        if (stopRequested) {
            console.log("\nForce quitting.");
            process.exit(130);
        }
        console.log("\nStop requested — finishing the current user, then exiting. (Ctrl+C again to force quit.) Re-run to resume.");
        stopRequested = true;
    });

    const client = new Client();

    try {
        await client.connect();
        console.log("Connected to database");

        // Phase 1: create only the users that are missing (idempotent across runs).
        // Fast, no network I/O, so it runs in a single transaction.
        const existing = (await client.query("SELECT count(*)::int AS c FROM users_details")).rows[0].c as number;
        const toCreate = Math.max(0, userCount - existing);
        if (toCreate > 0) {
            console.log(`Creating ${toCreate} user(s) (${existing} already exist)...`);
            await client.query("BEGIN");
            const tagMap = await seedTags(client);
            await seedUsers(client, toCreate, tagMap, existing);
            await client.query("COMMIT");
        } else {
            console.log(`${existing} user(s) already exist — skipping user creation.`);
        }

        // Phase 2 (RESUMABLE): download photos for every user still missing a
        // profile photo. profile_photo_id is set as the last step per user, so an
        // interrupted user stays NULL and is picked up again on the next run.
        const pending = (await client.query(
            "SELECT user_id FROM users_details WHERE profile_photo_id IS NULL ORDER BY user_id"
        )).rows.map((r) => r.user_id as number);

        if (pending.length === 0) {
            console.log("\nAll users already have photos — nothing to download.");
        } else {
            console.log(`\n${pending.length} user(s) still need photos. Downloading now — Ctrl+C to stop, then re-run to resume...`);
            await seedUserPhotos(client, pending);
        }

        const remaining = (await client.query(
            "SELECT count(*)::int AS c FROM users_details WHERE profile_photo_id IS NULL"
        )).rows[0].c as number;
        if (remaining === 0) {
            console.log(`\nSeeding complete — all users have photos. Password for all: "password123".`);
        } else {
            console.log(`\nStopped with ${remaining} user(s) still needing photos. Re-run \`bun run seed ${userCount}\` to continue.`);
        }
    } catch (error) {
        try { await client.query("ROLLBACK"); } catch { /* no active tx */ }
        console.error("Error seeding database:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
