import type { Message, Chat, ChatUser, MessageId } from "@/core/chat/Chat";
import type IMessageRepository from "@/core/chat/IMessageRepository";
import type { ILikeRepository } from "@/core/like/ILikeRepository";
import type { Like } from "@/core/like/Like";
import type { UserId } from "@/core/user/User";
import type { IUserRepository } from "@/core/user/IUserRepository";
import type { IBlockRepository } from "@/core/block/IBlockRepository";
import type { IUserSocketRegistry } from "@/core/socket/IUserSocketRegistry";
import type { User } from "@/core/user/User";

export default class ChatUseCases {
    private messageRepo;
    private likeRepo;
    private userRepo;
    private blockRepo;
    private socketRegistry;

    constructor(messageRepository: IMessageRepository, likeRepo: ILikeRepository, userRepo: IUserRepository, blockRepo: IBlockRepository, socketRegistry: IUserSocketRegistry) {
        this.messageRepo = messageRepository;
        this.likeRepo = likeRepo;
        this.userRepo = userRepo;
        this.blockRepo = blockRepo;
        this.socketRegistry = socketRegistry;
    }

    private toChatUser(otherUser: User): ChatUser {
        return {
            id: otherUser.id,
            name: otherUser.name,
            lastname: otherUser.lastname,
            lastConnection: otherUser.details?.lastConnection ?? null,
            isOnline: this.socketRegistry.getUserSocket(otherUser.id) ? true : false,
            profilePhotoPath: otherUser.details?.profilePhoto?.filePath ?? null
        };
    }

    async getUserChats(userId: UserId): Promise<Chat[]> {
        const userConnections: Like[] = await this.likeRepo.getUserConnections(userId);
        const blockedIds = new Set([
            ...await this.blockRepo.getBlockedIds(userId),
            ...await this.blockRepo.getBlockerIds(userId),
        ]);
        const otherUsersIds: UserId[] = userConnections
            .map((like) => like.liked)
            .filter(id => !blockedIds.has(id));
        // Only mutually-connected users may have a chat. Message history alone
        // must NOT keep a chat alive after a like is removed.
        const connectedIds = new Set(otherUsersIds);
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
            if (!connectedIds.has(key)) continue;
            const otherUser = await this.userRepo.findUserById(key);
            if (otherUser) {
                chats.push({
                    myId: userId,
                    otherUser: this.toChatUser(otherUser),
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
                    otherUser: this.toChatUser(otherUser),
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
