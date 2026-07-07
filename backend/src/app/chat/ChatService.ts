import type { Message } from "@/core/chat/Chat";
import type IMessageRepository from "@/core/chat/IMessageRepository";
import type { IUserSocketRegistry } from "@/core/socket/IUserSocketRegistry";
import type { Socket } from "@/core/socket/Socket";
import type { INotificationService } from "@/core/notification/INotificationService";
import type { IUserRepository } from "@/core/user/IUserRepository";
import type { ILikeRepository } from "@/core/like/ILikeRepository";
import type { LikePair } from "@/core/like/Like";

class ChatService {
    socketRegistry: IUserSocketRegistry;
    messageRepo: IMessageRepository;
    notificationService: INotificationService;
    userRepo: IUserRepository;
    likeRepo: ILikeRepository;

    constructor(socketRegistry: IUserSocketRegistry, messageRepository: IMessageRepository, notificationService: INotificationService, userRepo: IUserRepository, likeRepo: ILikeRepository) {
        this.socketRegistry = socketRegistry;
        this.messageRepo = messageRepository;
        this.notificationService = notificationService;
        this.userRepo = userRepo;
        this.likeRepo = likeRepo;
        this.socketRegistry.subscribeToEvent('chat:message', (socket: Socket, payload: any) => this.onNewMessage(socket, payload));
    }

    private async areConnected(userA: number, userB: number): Promise<boolean> {
        // A connection requires a mutual like (both directions present).
        const like: LikePair = await this.likeRepo.find(userA, userB);
        return like[0] != null && like[1] != null;
    }

    async onNewMessage(socket: Socket, payload: Message) {
        // Chat is only allowed between mutually-liked (connected) users. If the
        // connection was broken (e.g. one unliked the other), drop the message.
        if (!await this.areConnected(socket.userId, payload.receiver)) {
            return;
        }

        const targetSock: Socket | null = this.socketRegistry.getUserSocket(payload.receiver);

        if (!targetSock) {
            this.messageRepo.createMessage(socket.userId, payload.receiver, payload.message);
        }
        else {
            const msg: Message = await this.messageRepo.createMessage(socket.userId, payload.receiver, payload.message);
            targetSock.send("chat:message", msg);
        }

        const sender = await this.userRepo.findUserById(socket.userId);
        const receiver = await this.userRepo.findUserById(payload.receiver);
        if (sender && receiver) {
            this.notificationService.notifyUserMessage(sender, receiver).catch(() => {});
        }
    }
}

export default ChatService;