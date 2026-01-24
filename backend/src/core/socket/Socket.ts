import type { UserId } from "../user/User";

export type SocketId = string;

export interface Socket {
    id: SocketId;
    userId: UserId;

    send(event: string, data: any): boolean;
    disconnect(): void;
}