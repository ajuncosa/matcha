import type { NotificationUseCases } from "@/app/notifications/NotificationUseCases";
import type { Notification } from "@/core/notification/Notification";
import MatchaRouter from "@/infra/http/routers/MatchaRouter";

import { type Request, type Response } from "express";

export class NotificaitonRouter extends MatchaRouter {
    private notificationUseCases: NotificationUseCases;

    constructor(notificationUseCases: NotificationUseCases) {
        super();
        this.notificationUseCases = notificationUseCases;
        this.router.get("/new", (req, res) => this.getNewNotifications(req, res));
        this.router.post("/mark-as-viewed", (req, res) => this.getNewNotifications(req, res));
    }

    async getNewNotifications(req: Request, res: Response) {
        const newNotifs: Notification[] = await this.notificationUseCases.getNewNotifications(req.session.userId!);

        res.status(200).json(newNotifs);
    }

    async markNotificationsAsViewed(req: Request, res: Response) {

    }
}