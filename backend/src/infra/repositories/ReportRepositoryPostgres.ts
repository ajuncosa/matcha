import type { IReportRepository } from "@/core/report/IReportRepository";
import type { Pool } from "pg";

export class ReportRepositoryPostgres implements IReportRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async report(reporterId: number, reportedId: number): Promise<void> {
        await this.pool.query(
            `INSERT INTO reports(reporter_user_id, reported_user_id)
             SELECT $1, $2
             WHERE NOT EXISTS (
                 SELECT 1 FROM reports
                 WHERE reporter_user_id = $1 AND reported_user_id = $2
             )`,
            [reporterId, reportedId]
        );
    }
}
