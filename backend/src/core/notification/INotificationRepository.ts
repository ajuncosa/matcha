import type { Notification, NotificationId, NotificationType } from "@/core/notification/Notification";
import type { UserId } from "../user/User";

export interface INotificationRespository {
    findById(id: NotificationId): Promise<Notification | null>;
    findUnreadForUser(userId: UserId) : Promise<Notification[]>
    markNotificationsAsViewed(ids: NotificationId[]): Promise<void>;
    create(producer: UserId, target: UserId, type: NotificationType, text: string): Promise<Notification>;
    update(notification: Notification): Promise<Notification>;
}