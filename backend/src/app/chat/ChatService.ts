import type { Message } from "@/core/chat/Chat";
import type IMessageRepository from "@/core/chat/IMessageRepository";
import type { IUserSocketRegistry } from "@/core/socket/IUserSocketRegistry";
import type { Socket } from "@/core/socket/Socket";
import type { INotificationService } from "@/core/notification/INotificationService";
import type { IUserRepository } from "@/core/user/IUserRepository";

class ChatService {
    socketRegistry: IUserSocketRegistry;
    messageRepo: IMessageRepository;
    notificationService: INotificationService;
    userRepo: IUserRepository;

    constructor(socketRegistry: IUserSocketRegistry, messageRepository: IMessageRepository, notificationService: INotificationService, userRepo: IUserRepository) {
        this.socketRegistry = socketRegistry;
        this.messageRepo = messageRepository;
        this.notificationService = notificationService;
        this.userRepo = userRepo;
        this.socketRegistry.subscribeToEvent('chat:message', (socket: Socket, payload: any) => this.onNewMessage(socket, payload));
    }

    async onNewMessage(socket: Socket, payload: Message) {
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