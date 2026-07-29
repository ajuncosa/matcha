import type { ICommonPasswordRepository } from "@/core/password/ICommonPasswordRepository";
import type { Pool } from "pg";

export class CommonPasswordRepositoryPostgres implements ICommonPasswordRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async isCommon(password: string): Promise<boolean> {
        // Exact match against the primary-key index -> fast lookup.
        const res = await this.pool.query(
            "SELECT EXISTS (SELECT 1 FROM common_passwords WHERE password = $1) AS found",
            [password]
        );
        return res.rows[0].found === true;
    }
}
