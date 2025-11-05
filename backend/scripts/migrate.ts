import { readdir } from "node:fs/promises";
import { Client } from "pg";
import { join } from "node:path";

async function create_migrations_table(client: Client) : void
{
    const sql = "CREATE TABLE IF NOT EXISTS migrations (\
                    id SERIAL PRIMARY KEY,\
                    file TEXT not null,\
                    batch INT not null\
                );"
    await client.query(sql);
}

async function main()
{
    const migrations_dir: string = "./migrations";
    const migration_files: Array<string> = await readdir(migrations_dir);
    
    const client = new Client();
    await client.connect();

    create_migrations_table(client);

    const create_migrations_result = await client.query("SELECT * FROM migrations");
    const prev_migrations = create_migrations_result.rows;

    let executed_migrations = []

    for (const filename of migration_files) {
        if (!prev_migrations.some(e => e["file"] == filename))
        {
            const filepath: string = join(migrations_dir, filename);
            const file: string = await Bun.file(filepath).text();
            await client.query(file);
            executed_migrations.push(filename);
        }
    }

    if (executed_migrations.length != 0)
    {
        const max_match_result = await client.query("SELECT max(batch) FROM migrations");
        let batch_number: int = max_match_result.rows[0]["max"];
        if (batch_number == null)
            batch_number = 0;
        else
            batch_number += 1;
    
        for (const filename of executed_migrations) {
            await client.query("INSERT INTO migrations(file, batch) VALUES($1, $2)", [filename, batch_number]);
        }
    }

    await client.end();
}

await main();
