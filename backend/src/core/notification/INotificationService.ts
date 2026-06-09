import type { LikeNotification, MessageNotification, ProfileViewNotification, UnlikeNotification } from "@/core/notification/Notification";
import type { User } from "@/core/user/User";

export interface INotificationService {
    notifyUserLike(producer: User, target: User): Promise<LikeNotification>;
    notifyUserLikedBack(producer: User, target: User): Promise<LikeNotification>;
    notifyUserMessage(producer: User, target: User): Promise<MessageNotification>;
    notifiProfileView(producer: User, target: User): Promise<ProfileViewNotification>;
    notifyUnlikeNotification(producer: User, target: User): Promise<UnlikeNotification>;
}