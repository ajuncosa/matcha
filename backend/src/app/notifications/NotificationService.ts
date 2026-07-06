import type { INotificationRespository } from "@/core/notification/INotificationRepository";
import type { INotificationService } from "@/core/notification/INotificationService";
import { LikeNotification, NotificationType, type MessageNotification, type ProfileViewNotification, type UnlikeNotification } from "@/core/notification/Notification";
import type { IUserSocketRegistry } from "@/core/socket/IUserSocketRegistry";
import type { Socket } from "@/core/socket/Socket";
import type { User } from "@/core/user/User";

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
            targetSocket.send('notification:like', notif);
        }

        return notif;
    }

    async notifyUserLikedBack(producer: User, target: User): Promise<LikeNotification> {
        const notificationMessage: string = `${producer.name} ${producer.lastname} liked you back! You are now connected.`;
        const notif: LikeNotification = await this.notificationRepo.create(producer.id, target.id, NotificationType.LIKE, notificationMessage);
        const targetSocket: Socket | null = this.socketRegistry.getUserSocket(target.id);
        if (targetSocket) targetSocket.send('notification:like', notif);
        return notif;
    }

    async notifyUserMessage(producer: User, target: User): Promise<MessageNotification> {
        const notificationMessage: string = `${producer.name} ${producer.lastname} sent you a message.`;
        const notif = await this.notificationRepo.create(producer.id, target.id, NotificationType.MESSAGE, notificationMessage) as MessageNotification;
        const targetSocket: Socket | null = this.socketRegistry.getUserSocket(target.id);
        if (targetSocket) targetSocket.send('notification:message', notif);
        return notif;
    }

    async notifiProfileView(producer: User, target: User): Promise<ProfileViewNotification> {
        const notificationMessage: string = `${producer.name} ${producer.lastname} visited your profile.`;
        const notif = await this.notificationRepo.create(producer.id, target.id, NotificationType.PROFILE_VIEW, notificationMessage) as ProfileViewNotification;
        const targetSocket: Socket | null = this.socketRegistry.getUserSocket(target.id);
        if (targetSocket) targetSocket.send('notification:profile-view', notif);
        return notif;
    }

    async notifyUnlikeNotification(producer: User, target: User): Promise<UnlikeNotification> {
        const notificationMessage: string = `${producer.name} ${producer.lastname} unliked you.`;
        const notif = await this.notificationRepo.create(producer.id, target.id, NotificationType.UNLIKE, notificationMessage) as UnlikeNotification;

        const targetSocket: Socket | null = this.socketRegistry.getUserSocket(target.id);
        if (targetSocket) {
            targetSocket.send('notification:unlike', notif);
        }

        return notif;
    }
}
