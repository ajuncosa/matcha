import type { UserId } from "@/core/user/User";
import type { Like } from "@/core/like/Like";

export interface ILikeRepository {
    getUserConnections(userId: UserId): Promise<Like[]>;
}