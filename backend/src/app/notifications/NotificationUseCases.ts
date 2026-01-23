import type { INotificationRespository } from "@/core/notification/INotificationRepository";
import type { Notification, NotificationId } from "@/core/notification/Notification";
import type { UserId } from "@/core/user/User";

export class NotificationUseCases {

    notificationsRepo: INotificationRespository;

    constructor(notificationsRepo: INotificationRespository) {
        this.notificationsRepo = notificationsRepo;
    }

    async getNewNotifications(userId: UserId): Promise<Notification[]> {
        const unreadNotifications = await this.notificationsRepo.findUnreadForUser(userId);
        return unreadNotifications;
    }

    async markNotificationsAsViewed(notificationsIds: NotificationId[]): Promise<void> {
        this.notificationsRepo.markNotificationsAsViewed(notificationsIds);
    }
}