export interface IReportRepository {
    report(reporterId: number, reportedId: number): Promise<void>;
}
