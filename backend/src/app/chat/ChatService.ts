import type { Message } from "@/core/chat/Chat";
import type IMessageRepository from "@/core/chat/IMessageRepository";
import type { IUserSocketRegistry } from "@/core/socket/IUserSocketRegistry";
import type { Socket } from "@/core/socket/Socket";

class ChatService {
    socketRegistry: IUserSocketRegistry;
    messageRepo: IMessageRepository;

    constructor(socketRegistry: IUserSocketRegistry, messageRepository: IMessageRepository, ) {
        this.socketRegistry = socketRegistry;
        this.messageRepo = messageRepository;
        this.socketRegistry.subscribeToEvent('chat:message', (socket: Socket, payload: any) => this.onNewMessage(socket, payload));
    }

    async onNewMessage(socket: Socket, payload: Message) {
        //TODO: maybe we should check that the users are friends

        const targetSock: Socket | null = this.socketRegistry.getUserSocket(payload.receiver);

        if (!targetSock) {
            this.messageRepo.createMessage(socket.userId, payload.receiver, payload.message);
        }
        else {
            const msg: Message = await this.messageRepo.createMessage(socket.userId, payload.receiver, payload.message);
            targetSock.send("chat:message", msg);
        }

    }
}

export default ChatService;