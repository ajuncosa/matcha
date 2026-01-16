import type { User, UserId } from "@/core/user/User";

export interface Socket {
    userId: UserId;

    send(event: string, data: any): boolean;
}

export interface IUserSocketRegistry {
    getUserSocket(userId: UserId): Socket | null;
}