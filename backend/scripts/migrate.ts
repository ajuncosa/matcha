import { readdir } from "node:fs/promises";
import { Client } from "pg";
import { join } from "node:path";
import { parseArgs, type ParseArgsConfig } from "util";
import { type BunFile } from "bun";

interface Migration {
    id: number;
    file: string;
    batch: number;
}

class MigrationDownFileNotFound extends Error {
    constructor(file_path: string) {
        super("Could not find down file for migration:" + file_path);
    }
}

async function create_migrations_table(client: Client) : Promise<void>
{
    const sql = "CREATE TABLE IF NOT EXISTS migrations (\
                    id SERIAL PRIMARY KEY,\
                    file TEXT not null,\
                    batch INT not null\
                );"
    await client.query(sql);
}

async function run_migrations_up(client: Client, migrations_dir: string, migration_files: Array<string>) : Promise<void>
{
    let executed_migrations = []
    const create_migrations_result = await client.query("SELECT * FROM migrations");
    const prev_migrations: Migration[] = create_migrations_result.rows;
    let current_migration_file: string = "";
    let current_migration_query: string = "";

    try {
        await client.query("BEGIN");

        for (const filename of migration_files) {
            if (filename.includes(".down"))
                continue;

            if (!prev_migrations.some(e => e.file == filename))
            {
                const filepath: string = join(migrations_dir, filename);
                const file: string = await Bun.file(filepath).text();
                current_migration_query = file;
                current_migration_file = filename;
                await client.query(file);
                executed_migrations.push(filename);
                current_migration_file = "";
                current_migration_query = "";
            }
        }

        if (executed_migrations.length != 0)
        {
            const max_match_result = await client.query("SELECT max(batch) FROM migrations");
            let batch_number: number = max_match_result.rows[0]["max"];
            if (batch_number == null)
                batch_number = 0;
            else
                batch_number += 1;
        
            for (const filename of executed_migrations) {
                await client.query("INSERT INTO migrations(file, batch) VALUES($1, $2)", [filename, batch_number]);
            }
        }
        else {
            console.log("Nothing to migrate");
        }
        
        await client.query("COMMIT");
        
        console.log("Migrations executed:");
        for (const filename of executed_migrations) {
            console.log(filename);
        }
        console.log("Migration completed.");
    }
    catch (e) {
        console.error(`Error during migration, rolling back.`);
        console.error(`Error on file "${current_migration_file}". Query was: '${current_migration_query}'`);
        await client.query("ROLLBACK");
        throw e;
    }
}

async function run_migrations_down(client: Client, migrations_dir: string) : Promise<void>
{
    let executed_migrations: Array<string> = [];
    const last_migration_batch = await client.query("SELECT * \
                                                    FROM migrations \
                                                    WHERE batch = ( \
                                                        SELECT MAX(batch) \
                                                        FROM migrations \
                                                    ); \
                                                    ");
    const rollback_migrations: Migration[] = last_migration_batch.rows;
    if (rollback_migrations.length == 0) {
        console.log("No migrations left for rollback");
        return;
    }

    try {
        await client.query("BEGIN");
        
        const migrations_to_delete: Array<number> = [];
        for (const migration of rollback_migrations) {
            const filename = migration.file.replace(".up", ".down");
            const filepath: string = join(migrations_dir, filename);
            const file: BunFile = Bun.file(filepath);
            
            if (!file.exists()) {
                throw new MigrationDownFileNotFound(filepath);
            }

            const file_content = await file.text();
            client.query(file_content);
            executed_migrations.push(filename);
            migrations_to_delete.push(migration.id);
        }

        await client.query("DELETE from migrations where id IN($1)", migrations_to_delete);        
        
        await client.query("COMMIT");
        
        console.log("Migrations executed:");
        for (const filename of executed_migrations) {
            console.log(filename);
        }
        console.log("Migration compelted.");
    }
    catch (e) {
        console.error("Error during migration rollback, rolling back.");
        await client.query("ROLLBACK");
        
        if (e instanceof MigrationDownFileNotFound) {
            console.log(e.message);
        }
        else {
            throw e;
        }
    }
}

async function migrate(direction: "up" | "down"): Promise<void>
{
    const migrations_dir: string = "./migrations";
    const migration_files: Array<string> = await readdir(migrations_dir);
    
    const client = new Client();
    await client.connect();

    await create_migrations_table(client);

    if (direction === "up") {
        await run_migrations_up(client, migrations_dir, migration_files.sort());
    }
    else if (direction == "down") {
        await run_migrations_down(client, migrations_dir);
    }
    
    await client.end();
}

async function main()
{
    const argsOptions: ParseArgsConfig = {
        args: Bun.argv,
        options: {
            rollback: {
                type: "boolean",
            }
        },
        strict: true,
        allowPositionals: true,
    };

    try {
        const { values, positionals } = parseArgs(argsOptions);
        if ("rollback" in values)
            migrate("down");
        else
            migrate("up");
    }
    catch (e: any) {
        if (e.code && e.code == "ERR_PARSE_ARGS_UNKNOWN_OPTION")
            console.error("Invalid argument.");
        else
            throw e;
    }

}

await main();
