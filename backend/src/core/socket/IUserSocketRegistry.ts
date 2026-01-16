import type { User, UserId } from "@/core/user/User";

export type SocketId = string;

export interface Socket {
    id: SocketId;
    userId: UserId;

    send(event: string, data: any): boolean;
    disconnect(): void;
}

export interface IUserSocketRegistry {
    getUserSocket(userId: UserId): Socket | null;
}