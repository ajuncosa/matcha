import type { INotificationRespository } from "@/core/notification/INotificationRepository";
import type { INotificationService } from "@/core/notification/INotificationService";
import type { LikeNotification, MessageNotification, ProfileViewNotification, UnlikeNotification } from "@/core/notification/Notification";
import type { IUserSocketRegistry } from "@/core/socket/IUserSocketRegistry";
import type { UserId } from "@/core/user/User";

class NotificationService implements INotificationService {

    socketRegistry: IUserSocketRegistry;
    notificationRepo: INotificationRespository;

    constructor(socketRegistry: IUserSocketRegistry, notificationRepo: INotificationRespository) {
        this.socketRegistry = socketRegistry;
        this.notificationRepo = notificationRepo;
    }

    notifyUserLike(from: UserId, to: UserId): Promise<LikeNotification> {
        
    }

    notifyUserMessage(from: UserId, to: UserId): Promise<MessageNotification> {

    }

    notifiProfileView(from: UserId, to: UserId): Promise<ProfileViewNotification> {

    }

    notifyUnlikeNotification(from: UserId, to: UserId): Promise<UnlikeNotification> {
        
    }
}