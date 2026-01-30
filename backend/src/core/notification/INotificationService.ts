import type { LikeNotification, MessageNotification, ProfileViewNotification, UnlikeNotification } from "@/core/notification/Notification";
import type { User, UserId } from "@/core/user/User";

export interface INotificationService {
    notifyUserLike(from: User, to: User): Promise<LikeNotification>;
    notifyUserMessage(from: UserId, to: UserId): Promise<MessageNotification>;
    notifiProfileView(from: UserId, to: UserId): Promise<ProfileViewNotification>;
    notifyUnlikeNotification(from: UserId, to: UserId): Promise<UnlikeNotification>;
}