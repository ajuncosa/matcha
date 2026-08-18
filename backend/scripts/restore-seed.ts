import { Client } from "pg";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

// SQL dump used to seed a fresh database on first boot. Produced with:
//   pg_dump --no-owner --no-privileges --inserts --exclude-table-data=common_passwords
const SEED_DUMP_FILE = process.env.SEED_DUMP_FILE ?? "./seed/dump.sql";

async function main(): Promise<void> {
    const client = new Client();
    await client.connect();

    try {
        // Only restore into a fresh database — bail out if the schema already exists.
        const res = await client.query("SELECT to_regclass('public.users') AS tbl");
        if (res.rows[0].tbl !== null) {
            console.log("Database already initialized, skipping seed restore.");
            return;
        }
        if (!existsSync(SEED_DUMP_FILE)) {
            console.log(`No seed dump at ${SEED_DUMP_FILE}, skipping restore.`);
            return;
        }

        console.log(`Empty database — restoring seed from ${SEED_DUMP_FILE}...`);
        const raw = await readFile(SEED_DUMP_FILE, "utf8");
        // pg_dump (v15+/v18) emits psql meta-commands such as \restrict / \unrestrict
        // which are not valid SQL; strip those lines so the dump runs via the pg driver.
        const sql = raw
            .split("\n")
            .filter((line) => !line.startsWith("\\"))
            .join("\n");
        await client.query(sql);
        console.log("Seed restore complete.");
    } catch (e) {
        console.error("Error restoring seed dump:", e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

await main();
