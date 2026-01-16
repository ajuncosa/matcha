import type { User, UserId } from "@/core/user/User";

export type NotificationId = number;

export enum NotificationType {
    MESSAGE = 'message',
    LIKE = 'like',
    PROFILE_VIEW = 'profile_view',
    UNLIKE = 'unlike',
}

export abstract class Notification {
    id: NotificationId;
    producer: UserId;
    target: UserId;
    type: NotificationType;
    createdAt: Date;
    viewdAt: Date | null;
    payload: string;

    constructor(id: NotificationId, producer: UserId, target: UserId, type: NotificationType, payload: string) {
        this.id = id;
        this.producer = producer;
        this.target = target;
        this.type = type;
        this.createdAt = new Date();
        this.viewdAt = null;
        this.payload = payload;
    }

    markAsViewed(): void {
        this.viewdAt = new Date();
    }
}

export class MessageNotification extends Notification {

    constructor(id: NotificationId, producer: UserId, target: UserId, payload: string) {
        super(id, producer, target, NotificationType.MESSAGE, payload);
    }

}

export class LikeNotification extends Notification {

    constructor(id: NotificationId, producer: UserId, target: UserId, payload: string) {
        super(id, producer, target, NotificationType.LIKE, payload);
    }

}


export class ProfileViewNotification extends Notification {

    constructor(id: NotificationId, producer: UserId, target: UserId, payload: string) {
        super(id, producer, target, NotificationType.PROFILE_VIEW, payload);
    }

}

export class UnlikeNotification extends Notification {

    constructor(id: NotificationId, producer: UserId, target: UserId, payload: string) {
        super(id, producer, target, NotificationType.UNLIKE, payload);
    }

}
