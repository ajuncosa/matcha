import type { UserId } from "@/core/user/User";
import type { Like, LikePair } from "@/core/like/Like";

export interface ILikeRepository {
    find(producerId: UserId, targetId: UserId): Promise<LikePair>;
    create(producerId: UserId, targetId: UserId): Promise<Like>;
    delete(producerId: UserId, targetId: UserId): Promise<void>;
    getUserConnections(userId: UserId): Promise<Like[]>;
}