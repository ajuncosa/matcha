import type { Notification, NotificationId, NotificationType } from "@/core/notification/Notification";
import type { User, UserId } from "../user/User";

export interface INotificationRespository {
    findById(user: NotificationId): Promise<Notification | null>;
    findUnreadForUser(userId: UserId) : Promise<Notification[]>;
    create(producer: UserId, target: UserId, type: NotificationType, payload: string): Promise<Notification>;
    update(notification: Notification): Promise<Notification>;
}