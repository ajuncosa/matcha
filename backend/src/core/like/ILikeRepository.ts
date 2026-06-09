import type { UserId } from "@/core/user/User";
import type { Like, LikePair } from "@/core/like/Like";

export interface LikerInfo {
    id: number;
    name: string;
    lastname: string;
    profilePhotoPath: string | null;
    likedAt: Date;
}

export interface ILikeRepository {
    find(producerId: UserId, targetId: UserId): Promise<LikePair>;
    create(producerId: UserId, targetId: UserId): Promise<Like>;
    delete(producerId: UserId, targetId: UserId): Promise<void>;
    getUserConnections(userId: UserId): Promise<Like[]>;
    getLikers(userId: UserId): Promise<LikerInfo[]>;
}