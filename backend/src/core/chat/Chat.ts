import type { UserId } from "@/core/user/User";

export type MessageId = number;

export interface Message {
    id: MessageId;
    sender: UserId;
    receiver: UserId;
    message: string;
    sent_at: Date;
    viewed_at: Date | null;
}

export interface ChatUser {
    id: UserId;
    name: string;
    lastname: string;
}

export interface Chat {
    myId: UserId;
    otherUser: ChatUser;
    messages: Message[];
}