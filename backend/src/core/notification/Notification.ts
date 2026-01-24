import type { User, UserId } from "@/core/user/User";

export type NotificationId = number;

export enum NotificationType {
    MESSAGE = 'message',
    LIKE = 'like',
    PROFILE_VIEW = 'profile_view',
    UNLIKE = 'unlike',
}

export class Notification {
    id: NotificationId;
    producer: UserId;
    target: UserId;
    type: NotificationType;
    createdAt: Date;
    viewedAt: Date | null;
    text: string;

    constructor(
        id: NotificationId, 
        producer: UserId, 
        target: UserId, 
        type: NotificationType, 
        text: string, 
        createdAt: Date = new Date(),
        viewedAt: Date | null = null
    ) {
        this.id = id;
        this.producer = producer;
        this.target = target;
        this.type = type;
        this.text = text;
        this.createdAt = createdAt;
        this.viewedAt = viewedAt;
    }

    markAsViewed(): void {
        this.viewedAt = new Date();
    }
}

//FIXME: ?? Are these types above useless? :(

export class MessageNotification extends Notification {

    constructor(id: NotificationId, producer: UserId, target: UserId, text: string) {
        super(id, producer, target, NotificationType.MESSAGE, text);
    }

}

export class LikeNotification extends Notification {

    constructor(id: NotificationId, producer: UserId, target: UserId, text: string) {
        super(id, producer, target, NotificationType.LIKE, text);
    }

}


export class ProfileViewNotification extends Notification {

    constructor(id: NotificationId, producer: UserId, target: UserId, text: string) {
        super(id, producer, target, NotificationType.PROFILE_VIEW, text);
    }

}

export class UnlikeNotification extends Notification {

    constructor(id: NotificationId, producer: UserId, target: UserId, text: string) {
        super(id, producer, target, NotificationType.UNLIKE, text);
    }

}

export function getNotificationTypeFromString(str: string): NotificationType {
    str = str.toLowerCase();
    if (str == "message")
        return NotificationType.MESSAGE;
    else if (str == "like")
        return NotificationType.LIKE;
    else if (str == "profile_view")
        return NotificationType.PROFILE_VIEW;
    else
        return NotificationType.UNLIKE;
}

export function getNotificationStringFromType(type: NotificationType): string {
    if (type == NotificationType.MESSAGE)
        return "message";
    else if (type == NotificationType.LIKE)
        return "like";
    else if (type == NotificationType.PROFILE_VIEW)
        return "profile_view";
    else
        return "unlike";
}