import type { INotificationRespository } from "@/core/notification/INotificationRepository";
import type { Notification, NotificationId } from "@/core/notification/Notification";
import type { UserId } from "@/core/user/User";

export class NotificationUseCases {

    notificationsRepo: INotificationRespository;

    constructor(notificationsRepo: INotificationRespository) {
        this.notificationsRepo = notificationsRepo;
    }

    getNewNotifications(userId: UserId): Promise<Notification[]> {
        
    }

    markNotificationAsViewed(notificationId: NotificationId): Promise<Notification> {
        
    }
}