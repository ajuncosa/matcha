import type { NotificationUseCases } from "@/app/notifications/NotificationUseCases";
import type { Notification, NotificationId } from "@/core/notification/Notification";
import MatchaRouter from "@/infra/http/routers/MatchaRouter";

import { type Request, type Response } from "express";

export class NotificaitonRouter extends MatchaRouter {
    private notificationUseCases: NotificationUseCases;

    constructor(notificationUseCases: NotificationUseCases) {
        super();
        this.notificationUseCases = notificationUseCases;
        this.router.get("/new", (req, res) => this.getNewNotifications(req, res));
        this.router.post("/mark-as-viewed", (req, res) => this.markNotificationsAsViewed(req, res));
    }

    async getNewNotifications(req: Request, res: Response) {
        const newNotifs: Notification[] = await this.notificationUseCases.getNewNotifications(req.session.userId!);

        res.status(200).json(newNotifs);
    }

    async markNotificationsAsViewed(req: Request, res: Response) {
        if (!req.body || !req.body.notificationsIds) {
            res.status(400).send("Missing notifications ids");
        }

        this.notificationUseCases.markNotificationsAsViewed(req.body.notificationsIds);

        res.status(200).send();
    }
}