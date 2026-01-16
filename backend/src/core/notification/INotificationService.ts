import type { LikeNotification, MessageNotification, ProfileViewNotification, UnlikeNotification } from "@/core/notification/Notification";
import type { UserId } from "@/core/user/User";

export interface INotificationService {
    notifyUserLike(from: UserId, to: UserId): Promise<LikeNotification>;
    notifyUserMessage(from: UserId, to: UserId): Promise<MessageNotification>;
    notifiProfileView(from: UserId, to: UserId): Promise<ProfileViewNotification>;
    notifyUnlikeNotification(from: UserId, to: UserId): Promise<UnlikeNotification>;
}