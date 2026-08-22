import { createContext, useContext, useEffect, useRef, useState } from "react";
import AuthContext from "./AuthContextProvider";
import SocketContext from "./SocketContextProvider";
import { API_URL } from "@/lib/config";

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
    lastConnection: string | null;
    isOnline: boolean;
    profilePhotoPath: string | null;
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
    refreshChats: () => Promise<void>;
}

const defaultChatContext: ChatContext = {
    chats: [],
    sendMessage: () => {},
    setMessagesAsViewed: async () => {},
    refreshChats: async () => {}
};

const ChatContext = createContext<ChatContext>(defaultChatContext);

export function ChatContextProvider({children}: {children: React.ReactElement}) {
    const { user } = useContext(AuthContext);
    const socket = useContext(SocketContext);
    const [chats, setChats] = useState<Chat[]>([]);
    // The socket 'chat:message' handler is registered once and would otherwise
    // close over a stale chats value. Keep a ref in sync so it can read the
    // current list (e.g. to tell whether the sender's chat is loaded yet).
    const chatsRef = useRef<Chat[]>([]);
    useEffect(() => { chatsRef.current = chats; }, [chats]);

    async function fetchChats() {
        const request = await fetch(`${API_URL}/chat`);
        // Not authenticated (or any error): the body isn't chat JSON, so bail out.
        if (!request.ok)
            return;
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

        await fetch(`${API_URL}/chat/viewed`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messagesIds: messageIds
            })
        });
    }

    function updatePresence(payload: { userId: number; isOnline: boolean; lastConnection: string | null }) {
        setChats((prevChats) =>
            prevChats.map((chat) =>
                chat.otherUser.id === payload.userId
                    ? {
                        ...chat,
                        otherUser: {
                            ...chat.otherUser,
                            isOnline: payload.isOnline,
                            lastConnection: payload.lastConnection ?? chat.otherUser.lastConnection
                        }
                    }
                    : chat
            )
        );
    }

    function closeChat(payload: { userId: number }) {
        setChats((prevChats) => prevChats.filter((chat) => chat.otherUser.id !== payload.userId));
    }

    async function receiveMessage(payload: Message) {
        // Conversation not in our local list yet — this happens when the match was
        // made after we loaded chats (log in, then match, then get a message). Pull
        // the authoritative list so the new chat and its unread count (and thus the
        // sidebar badge) appear live instead of only after opening the chat page.
        const chatLoaded = chatsRef.current.some((chat) => chat.otherUser.id == payload.sender);
        if (!chatLoaded) {
            await fetchChats();
            return;
        }

        setChats((prevChats) => {
            return prevChats.map((chat) => {
                if (chat.otherUser.id == payload.sender) {
                    return {
                        ...chat,
                        messages: [...chat.messages, payload],
                        // Bump the unread counter so the sidebar/list badge updates live.
                        unreadMessages: chat.unreadMessages + 1
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
        // Only load chats for an authenticated user; clear them on logout.
        if (user.loggedIn) {
            fetchChats();
        } else {
            setChats([]);
        }
        const subscriberId: number = socket.subscribeToEvent(
            'chat:message',
            "ChatContextProvider",
            (message) => receiveMessage(message)
        );
        const presenceSubId: number = socket.subscribeToEvent(
            'presence:update',
            "ChatContextProvider",
            (payload) => updatePresence(payload)
        );
        const chatClosedSubId: number = socket.subscribeToEvent(
            'chat:closed',
            "ChatContextProvider",
            (payload) => closeChat(payload)
        );
        // Resync on every (re)connect so messages that arrived while the socket
        // was down still surface (and the unread badge stays accurate). Refetch
        // pulls authoritative server state, so it never invents unread messages.
        const reconnectSubId: number = socket.subscribeToEvent(
            'socket:connect',
            "ChatContextProvider",
            () => { if (user.loggedIn) fetchChats(); }
        );

        return () => {
            socket.unsubscribeFromEvent(subscriberId, 'chat:message', "ChatContextProvider");
            socket.unsubscribeFromEvent(presenceSubId, 'presence:update', "ChatContextProvider");
            socket.unsubscribeFromEvent(chatClosedSubId, 'chat:closed', "ChatContextProvider");
            socket.unsubscribeFromEvent(reconnectSubId, 'socket:connect', "ChatContextProvider");
        }

    }, [user.loggedIn]);

    return (
        <ChatContext value={{chats, sendMessage, setMessagesAsViewed, refreshChats: fetchChats}}>
            {children}
        </ChatContext>
    )
}

export default ChatContext;