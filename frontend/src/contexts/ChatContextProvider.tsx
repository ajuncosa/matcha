import { createContext, useContext, useEffect, useRef, useState } from "react";
import AuthContext from "./AuthContextProvider";
import NotificationsContext from "./NotificationsContextProvider";
import SocketContext from "./SocketContextProvider";

export interface Message {
    id: number;
    sender: number;
    receiver: number;
    message: string;
    sent_at: Date;
    viewed_at: Date | null;
}

export interface ChatUser {
    id: number;
    name: string;
    lastname: string;
}

export interface Chat {
    myId: number;
    otherUser: ChatUser;
    messages: Message[];
    unreadMessages: number;
}

interface ChatContext {
    chats: Chat[];
    sendMessage: CallableFunction;
    setMessagesAsViewed: (chatIndex: number, messageIds: number[]) => Promise<void>;
}

const defaultChatContext: ChatContext = {
    chats: [],
    sendMessage: () => {},
    setMessagesAsViewed: async () => {}
};

const ChatContext = createContext<ChatContext>(defaultChatContext);

export function ChatContextProvider({children}: {children: React.ReactElement}) {
    const { user } = useContext(AuthContext);
    const socket = useContext(SocketContext);
    const { addNotification } = useContext(NotificationsContext);
    const [chats, setChats] = useState<Chat[]>([]);

    async function fetchChats() {
        const request = await fetch("http://localhost/api/chat");
        const chatsResponse: Chat[] = await request.json();
        
        if (chatsResponse.length < 0)
            return;

        // Count the number of unseen messages
        chatsResponse.forEach((chat, index) => {
            const nUnreadMessages: number = chat.messages.reduce((acc, msg) => {
                if (msg.sender == user.id) return acc;
                if (msg.viewed_at) return acc;
                else return acc + 1;
            }, 0);
            chatsResponse[index].unreadMessages = nUnreadMessages;
        });

        setChats(chatsResponse);
    }

    async function setMessagesAsViewed(chatIndex: number, messageIds: number[]): Promise<void> {
        setChats(chats => 
            chats.map((chat, index) => 
                index !== chatIndex
                ? chat
                : {
                    ...chat,
                    messages: chat.messages.map(msg => ({
                    ...msg,
                    viewed_at: new Date()
                    })),
                    unreadMessages: 0
                }
            )
        );

        await fetch("http://localhost/api/chat/viewed", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messagesIds: messageIds
            })
        });
    }

    async function receiveMessage(payload: Message) {
        setChats((prevChats) => {
            return prevChats.map((chat) => {
                if (chat.otherUser.id == payload.sender) {
                    return {
                        ...chat,
                        messages: [...chat.messages, payload]
                    }
                }
                else {
                    return chat;
                }
            });
        });
    }

    async function sendMessage(receiver: number, message: string) {
        const newMessage: Partial<Message> = {
            sender: user.id,
            receiver: Number(receiver),
            message: message,
            sent_at: new Date()
        }

        setChats((prevChats) => {
            return prevChats.map((chat) => {
                if (chat.otherUser.id == receiver) {
                    return {
                        ...chat,
                        messages: [...chat.messages, {
                            id: 0,
                            sender: user.id,
                            receiver: receiver,
                            message: message,
                            sent_at: new Date(),
                            viewed_at: null
                        }]
                    }
                }
                else {
                    return chat;
                }
            });
        });

        socket.emitEventToServer('chat:message', newMessage);
    }

    useEffect(() => {
        fetchChats();
        const subscriberId: number = socket.subscribeToEvent(
            'chat:message',
            "ChatContextProvider",
            (message) => receiveMessage(message)
        );

        return () => {
            socket.unsubscribeFromEvent(subscriberId, 'chat:message', "ChatContextProvider");
        }

    }, [user.loggedIn]);

    return (
        <ChatContext value={{chats, sendMessage, setMessagesAsViewed}}>
            {children}
        </ChatContext>
    )
}

export default ChatContext;