import type ChatUseCases from "@/app/chat/ChatUseCases";
import type { Chat, MessageId } from "@/core/chat/Chat";
import MatchaRouter from "@/infra/http/routers/MatchaRouter";

import { type Request, type Response } from "express";

export default class ChatRouter extends MatchaRouter {
    private chatUseCases: ChatUseCases;

    constructor(chatUseCases: ChatUseCases) {
        super();
        this.chatUseCases = chatUseCases;
        this.router.get("/", (req, res) => this.getUserChats(req, res));
        this.router.post("/viewed", (req, res) => this.markMessagesAsViewed(req, res));
    }

    async getUserChats(req: Request, res: Response) {
        const chats: Chat[] = await this.chatUseCases.getUserChats(req.session.userId!);

        res.status(200).json(chats);
    }

    async markMessagesAsViewed(req: Request, res: Response) {
        if (!req.body || !req.body.messagesIds) {
            res.status(400).send("Missing notifications ids");
        }

        console.log(req.body);

        await this.chatUseCases.markMessagesAsViewed(req.body.messagesIds);

        res.status(200).send();
    }
}