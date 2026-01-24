import type { UserId } from "@/core/user/User";
import type { Socket } from "@/core/socket/Socket";

export interface IUserSocketRegistry {
    getUserSocket(userId: UserId): Socket | null;
}