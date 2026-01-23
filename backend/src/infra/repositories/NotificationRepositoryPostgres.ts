import { type INotificationRespository } from "@/core/notification/INotificationRepository";
import { Notification, getNotificationStringFromType, getNotificationTypeFromString, type NotificationId, type NotificationType } from "@/core/notification/Notification";
import type { UserId } from "@/core/user/User";
import type { Pool } from "pg";

class NotificationRepositoryPostgres implements INotificationRespository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async findById(id: NotificationId): Promise<Notification | null> {
        const notificationQuery = await this.pool.query("SELECT * FROM notifications WHERE id=$1", [id]);
        if (notificationQuery.rows.length == 0)
            return null;
        
        const notification = new Notification(
            notificationQuery.rows[0].id,
            notificationQuery.rows[0].producer,
            notificationQuery.rows[0].target,
            getNotificationTypeFromString(notificationQuery.rows[0].type),
            notificationQuery.rows[0].payload,
            new Date(notificationQuery.rows[0].created_at),
            new Date(notificationQuery.rows[0].viewed_at)
        );
        
        return notification;
    }

    async findUnreadForUser(userId: UserId) : Promise<Notification[]> {
        const notificationsQuery = await this.pool.query("SELECT * FROM notifications WHERE viewed_at=NULL AND target_user_id=$1", [userId]);
        if (notificationsQuery.rows.length == 0)
            return [];
        
        const notifications: Notification[] = notificationsQuery.rows.map((row: any) => {
            return new Notification(
                row.rows[0].id,
                row.rows[0].producer,
                row.rows[0].target,
                getNotificationTypeFromString(row.rows[0].type),
                row.rows[0].payload,
                new Date(row.rows[0].created_at),
                new Date(row.rows[0].viewed_at)
            );
        });

        return notifications;
    }

    async create(producer: UserId, target: UserId, type: NotificationType, payload: string): Promise<Notification> {
        const notificationType: string = getNotificationStringFromType(type);
        const query = await this.pool.query("\
            INSERT INTO notifications(producer, target, type, createdAt, viewedAt, payload) \
            VALUES($1, $2, $3, CURRENT_TIMESTAMP, NULL, $4) \
            RETURNING id, created_at",
            [producer, target, notificationType, payload]
        );
        
        return new Notification(
            query.rows[0].id,
            producer,
            target,
            type,
            payload,
            query.rows[0].created_at,
            null
        );
    }

    async update(notification: Notification): Promise<Notification> {
        await this.pool.query("\
            UPDATE notifications \
            SET producer_user_id=$2, target_user_id=$3, type=$4, payload=$5, viewed_at=$6\
            WHERE id = $1",
            [
                notification.id,
                notification.producer,
                notification.target,
                notification.type,
                notification.payload,
                notification.viewedAt
            ]
        );

        return notification;
    }
}