import type { UserId } from "@/core/user/User";
import type { Socket } from "@/core/socket/Socket";

export type EventName = string;
export type EventCallback = (socket: Socket, payload: any) => void;

export interface IUserSocketRegistry {
    getUserSocket(userId: UserId): Socket | null;
    subscribeToEvent(eventName: EventName, callback: EventCallback): void
}