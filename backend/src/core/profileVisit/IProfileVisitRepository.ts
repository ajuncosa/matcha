export interface ProfileVisitorInfo {
    id: number;
    name: string;
    lastname: string;
    profilePhotoPath: string | null;
    lastVisitedAt: Date;
}

export interface IProfileVisitRepository {
    record(visitorId: number, visitedId: number): Promise<void>;
    getVisitors(visitedUserId: number): Promise<ProfileVisitorInfo[]>;
    hadVisited(visitorId: number, visitedId: number): Promise<boolean>;
}
