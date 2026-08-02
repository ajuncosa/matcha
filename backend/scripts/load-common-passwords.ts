import { Client } from "pg";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

// Path to the one-password-per-line file. Overridable via env for the Docker image.
const PASSWORDS_FILE = process.env.COMMON_PASSWORDS_FILE ?? "./10-million-passwords.txt";
// One column, so we stay well under Postgres' 65535 bind-parameter limit per query.
const BATCH_SIZE = 10000;

async function tableIsEmpty(client: Client): Promise<boolean> {
    const res = await client.query("SELECT EXISTS (SELECT 1 FROM common_passwords) AS has_rows");
    return res.rows[0].has_rows === false;
}

async function insertBatch(client: Client, batch: string[]): Promise<void> {
    if (batch.length === 0) return;
    const placeholders = batch.map((_, i) => `($${i + 1})`).join(",");
    // ON CONFLICT DO NOTHING dedups any repeated passwords in the source file.
    await client.query(
        `INSERT INTO common_passwords(password) VALUES ${placeholders} ON CONFLICT DO NOTHING`,
        batch
    );
}

async function main(): Promise<void> {
    const client = new Client();
    await client.connect();

    try {
        // Only load if the table has no rows, so this is safe to run on every boot.
        if (!(await tableIsEmpty(client))) {
            console.log("common_passwords already populated, skipping load.");
            return;
        }

        console.log(`Loading common passwords from ${PASSWORDS_FILE}...`);
        const rl = createInterface({
            input: createReadStream(PASSWORDS_FILE),
            crlfDelay: Infinity,
        });

        let batch: string[] = [];
        let total = 0;

        for await (const line of rl) {
            if (line.length === 0) continue;
            batch.push(line.toLowerCase());
            if (batch.length >= BATCH_SIZE) {
                await insertBatch(client, batch);
                total += batch.length;
                batch = [];
                if (total % 500000 === 0) console.log(`  loaded ${total} passwords...`);
            }
        }
        await insertBatch(client, batch);
        total += batch.length;

        console.log(`Done. Loaded ${total} common passwords.`);
    } catch (e) {
        console.error("Error loading common passwords:", e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

await main();
