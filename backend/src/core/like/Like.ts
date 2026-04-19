import type { UserId } from "@/core/user/User";

type LikeId = number;

export interface Like {
    id: LikeId;
    liker: UserId;
    liked: UserId;
    createdAt: Date;
}

export type LikePair = [Like | null, Like | null];