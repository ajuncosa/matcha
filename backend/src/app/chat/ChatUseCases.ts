import type { Message, Chat, ChatUser, MessageId } from "@/core/chat/Chat";
import type IMessageRepository from "@/core/chat/IMessageRepository";
import type { ILikeRepository } from "@/core/like/ILikeRepository";
import type { Like } from "@/core/like/Like";
import type { UserId } from "@/core/user/User";
import type { IUserRepository } from "@/core/user/IUserRepository";

export default class ChatUseCases {
    private messageRepo;
    private likeRepo;
    private userRepo;

    constructor(messageRepository: IMessageRepository, likeRepo: ILikeRepository, userRepo: IUserRepository) {
        this.messageRepo = messageRepository;
        this.likeRepo = likeRepo;
        this.userRepo = userRepo;
    }

    async getUserChats(userId: UserId): Promise<Chat[]> {
        const userConnections: Like[] = await this.likeRepo.getUserConnections(userId);
        const otherUsersIds: UserId[] = userConnections.map((like) => like.liked);
        const userMessages: Message[] = await this.messageRepo.getUserMessages(userId);
        let messagesByUser: Map<UserId, Message[]> = new Map();

        userMessages.forEach((m) => {
            const targetUser: number = m.receiver == userId ? m.sender : m.receiver;
            let msgs: Message[] | undefined = messagesByUser.get(targetUser);
            if (!msgs)
                messagesByUser.set(targetUser, [m]);
            else
                msgs.push(m);
        });

        let chats: Chat[] = [];
        for (let [key, value] of messagesByUser.entries()) {
            const otherUser = await this.userRepo.findUserById(key);
            if (otherUser) {
                chats.push({
                    myId: userId,
                    otherUser: {
                        id: otherUser.id,
                        name: otherUser.name,
                        lastname: otherUser.lastname
                    },
                    messages: value
                });
            }
        }

        const chatsWithoutMessages: UserId[] = otherUsersIds.filter((id => {
            const chatExists = messagesByUser.get(id);
            if (chatExists)
                return false;
            
            return true;
        }));
        
        for (const id of chatsWithoutMessages) {
            const otherUser = await this.userRepo.findUserById(id);
            if (otherUser) {
                chats.push({
                    myId: userId,
                    otherUser: {
                        id: otherUser.id,
                        name: otherUser.name,
                        lastname: otherUser.lastname
                    },
                    messages: []
                });
            }
        }
        
        return chats;
    }

    async markMessagesAsViewed(messagesIds: MessageId[]): Promise<void> {
        await this.messageRepo.markMessagesAsViewed(messagesIds);
    }
}
