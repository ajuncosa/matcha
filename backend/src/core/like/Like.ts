import type { UserId } from "@/core/user/User";

type LikeId = number;

export interface Like {
    id: LikeId;
    liker: UserId;
    liked: UserId;
}