import { Client } from "pg";
import * as bcrypt from "bcryptjs";

const firstNames = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
    "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
    "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
    "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
    "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
    "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen", "Stephen", "Anna",
    "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma",
    "Benjamin", "Samantha", "Samuel", "Katherine", "Gregory", "Christine", "Frank", "Debra",
    "Alexander", "Rachel", "Raymond", "Catherine", "Patrick", "Carolyn", "Jack", "Janet"
];

const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
    "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
    "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
    "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
    "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
    "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
    "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
    "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza",
    "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers"
];

const biographies = [
    "Love hiking and outdoor adventures. Always looking for new trails to explore!",
    "Coffee enthusiast and book lover. Let's discuss philosophy over espresso.",
    "Software developer by day, musician by night. I play guitar and piano.",
    "Foodie who loves trying new restaurants. Sushi is my weakness!",
    "Fitness junkie and yoga instructor. Mind, body, and soul connection.",
    "Travel addict with 20+ countries visited. Where to next?",
    "Dog parent to two golden retrievers. Animal lover for life!",
    "Art gallery hopper and museum enthusiast. Contemporary art is my passion.",
    "Beach volleyball player and sun chaser. Summer is my season!",
    "Board game collector and strategy game master. Game night anyone?",
    "Photography hobbyist capturing moments. Nature and portrait photography.",
    "Wine tasting enthusiast and amateur sommelier. Red or white?",
    "Marathon runner training for my 10th race. Never stop moving!",
    "Movie buff and cinema lover. Classics, indie, and blockbusters!",
    "Gardening enthusiast with a green thumb. My plants are my babies.",
    "Cooking experimentalist. Always trying new recipes from around the world.",
    "Tech startup founder working on something big. Entrepreneur life!",
    "Volunteer at local animal shelter. Making a difference, one paw at a time.",
    "Meditation practitioner finding inner peace. Namaste!",
    "Sports fanatic - football, basketball, soccer. Love them all!",
    "Craft beer connoisseur. Always on the hunt for the perfect IPA.",
    "Dancing through life - salsa, bachata, and tango. Let's dance!",
    "Vintage vinyl collector. Nothing beats the sound of a record player.",
    "Scuba diver exploring underwater worlds. The ocean is my happy place.",
    "Podcast host discussing true crime and mysteries. Listen in!",
    "Pottery maker creating functional art. Each piece is unique.",
    "Language learner currently studying Japanese. Konnichiwa!",
    "Rock climber always looking for new challenges. Reach new heights!",
    "Stand-up comedy fan and amateur comedian. Laughter is the best medicine.",
    "Sustainable living advocate. Small changes make a big difference!"
];

const tagNames = [
    "hiking", "coffee", "reading", "music", "gaming", "foodie", "fitness", "yoga",
    "travel", "dogs", "cats", "art", "photography", "beach", "movies", "cooking",
    "tech", "volunteering", "meditation", "sports", "beer", "dancing", "vinyl", "diving",
    "podcasts", "pottery", "languages", "climbing", "comedy", "sustainability",
    "wine", "running", "gardening", "startups", "fashion", "writing", "painting",
    "skiing", "surfing", "cycling", "karaoke", "brunch", "tattoos", "astrology",
    "chess", "board-games", "hockey", "basketball", "soccer", "tennis"
];

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

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
    return arr[randomInt(0, arr.length - 1)] as T;
}

function generateBirthday(age: number): Date {
    const now = new Date();
    const year = now.getFullYear() - age;
    const month = randomInt(0, 11);
    const day = randomInt(1, 28);
    return new Date(year, month, day);
}

function generateLocation(): { lat: number; lon: number } {
    // Scatter users around Madrid centre within ~15 km radius
    const MADRID_LAT = 40.4168;
    const MADRID_LON = -3.7038;
    const RADIUS = 0.15; // ~15 km in degrees

    const offsetLat = (Math.random() * 2 - 1) * RADIUS;
    const offsetLon = (Math.random() * 2 - 1) * RADIUS;

    return {
        lat: Math.round((MADRID_LAT + offsetLat) * 10000) / 10000,
        lon: Math.round((MADRID_LON + offsetLon) * 10000) / 10000,
    };
}

function generateUsers(count: number): SeedUser[] {
    const users: SeedUser[] = [];
    
    for (let i = 0; i < count; i++) {
        const name = randomItem(firstNames);
        const lastname = randomItem(lastNames);
        const age = randomInt(20, 45);
        const birthday = generateBirthday(age);
        const location = generateLocation();
        const profile = generateCompatibleProfile();
        const numTags = randomInt(2, 6);
        const userTags: string[] = [];

        while (userTags.length < numTags) {
            const tag = randomItem(tagNames);
            if (!userTags.includes(tag)) {
                userTags.push(tag);
            }
        }

        users.push({
            name,
            lastname,
            email: `${name.toLowerCase()}.${lastname.toLowerCase()}${randomInt(1, 999)}@example.com`,
            password: "password123",
            gender: profile.gender,
            sex: profile.sex,
            preferredGender: profile.preferredGender,
            preferredSex: profile.preferredSex,
            preferredMinAge: 18,
            preferredMaxAge: 60,
            lat: location.lat,
            lon: location.lon,
            biography: randomItem(biographies),
            fameRating: randomInt(0, 100),
            birthday,
            tags: userTags,
        });
    }
    
    return users;
}

async function seedTags(client: Client): Promise<Map<string, number>> {
    const tagMap = new Map<string, number>();
    
    for (const tagName of tagNames) {
        // Check if tag already exists
        const existingResult = await client.query(
            "SELECT id FROM tags WHERE name = $1",
            [tagName]
        );
        
        if (existingResult.rows.length > 0) {
            tagMap.set(tagName, existingResult.rows[0].id);
        } else {
            const result = await client.query(
                "INSERT INTO tags(name) VALUES($1) RETURNING id",
                [tagName]
            );
            tagMap.set(tagName, result.rows[0].id);
        }
    }
    
    console.log(`Seeded ${tagNames.length} tags`);
    return tagMap;
}

async function seedUsers(client: Client, count: number, tagMap: Map<string, number>): Promise<void> {
    const users = generateUsers(count);
    let seededCount = 0;
    
    for (const user of users) {
        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Insert user
        const userResult = await client.query(
            `INSERT INTO users(name, lastname, email, email_validated_at, password, created_at)
             VALUES($1, $2, $3, CURRENT_TIMESTAMP, $4, CURRENT_TIMESTAMP)
             RETURNING id`,
            [user.name, user.lastname, user.email, hashedPassword]
        );
        
        const userId = userResult.rows[0].id;
        
        // Insert user details
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
        
        // Insert tags for user
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
}

async function seedPhotos(client: Client): Promise<void> {
    // Create some placeholder photo entries
    const photoPaths = [
        "profiles/user1.jpg",
        "profiles/user2.jpg",
        "profiles/user3.jpg",
        "profiles/user4.jpg",
        "profiles/user5.jpg",
        "profiles/user6.jpg",
        "profiles/user7.jpg",
        "profiles/user8.jpg",
        "profiles/user9.jpg",
        "profiles/user10.jpg",
    ];
    
    for (const path of photoPaths) {
        // Check if photo already exists
        const existingResult = await client.query(
            "SELECT id FROM photos WHERE file_path = $1",
            [path]
        );
        
        if (existingResult.rows.length === 0) {
            await client.query(
                "INSERT INTO photos(file_path) VALUES($1)",
                [path]
            );
        }
    }
    
    console.log(`Seeded ${photoPaths.length} photos`);
}

async function main() {
    const args = process.argv.slice(2);
    const userCount = parseInt(args[0] ?? "") || 50;
    
    console.log(`Starting database seeding with ${userCount} users...`);
    
    const client = new Client();
    
    try {
        await client.connect();
        console.log("Connected to database");
        
        // Start transaction
        await client.query("BEGIN");
        
        // Seed tags first
        const tagMap = await seedTags(client);
        
        // Seed photos
        await seedPhotos(client);
        
        // Seed users
        await seedUsers(client, userCount, tagMap);
        
        // Commit transaction
        await client.query("COMMIT");
        
        console.log("\nDatabase seeding completed successfully!");
        console.log(`Created:`);
        console.log(`  - ${userCount} users`);
        console.log(`  - ${tagNames.length} tags`);
        console.log(`All users have password: "password123"`);
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error seeding database:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
