import type { INotificationRespository } from "@/core/notification/INotificationRepository";
import type { INotificationService } from "@/core/notification/INotificationService";
import { LikeNotification, NotificationType, type MessageNotification, type ProfileViewNotification, type UnlikeNotification } from "@/core/notification/Notification";
import type { IUserSocketRegistry } from "@/core/socket/IUserSocketRegistry";
import type { Socket } from "@/core/socket/Socket";
import type { User, UserId } from "@/core/user/User";

export class NotificationService implements INotificationService {

    socketRegistry: IUserSocketRegistry;
    notificationRepo: INotificationRespository;

    constructor(socketRegistry: IUserSocketRegistry, notificationRepo: INotificationRespository) {
        this.socketRegistry = socketRegistry;
        this.notificationRepo = notificationRepo;
    }

    async notifyUserLike(producer: User, target: User): Promise<LikeNotification> {
        //TODO: add notification to databse
        const notificationMessage: string = `${producer.name} ${producer.lastname} liked you.`;
        const notif: LikeNotification = await this.notificationRepo.create(producer.id, target.id, NotificationType.LIKE, notificationMessage);

        const targetSocket: Socket | null = this.socketRegistry.getUserSocket(target.id);

        if (targetSocket) {
            targetSocket.send('notification-like', notif);
        }

        return notif;
    }

    notifyUserMessage(from: UserId, to: UserId): Promise<MessageNotification> {

    }

    notifiProfileView(from: UserId, to: UserId): Promise<ProfileViewNotification> {

    }

    notifyUnlikeNotification(from: UserId, to: UserId): Promise<UnlikeNotification> {

    }
}
