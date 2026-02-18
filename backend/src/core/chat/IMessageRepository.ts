import type { User, UserId } from "../user/User";
import type { Message, MessageId } from "./Chat";

export default interface IMessageRepository {
    getUserMessages(userId: UserId): Promise<Message[]>;
    markMessagesAsViewed(messageid: MessageId[]): Promise<void>;
    createMessage(sender: UserId, receiver: UserId, message: string): Promise<Message>;
}