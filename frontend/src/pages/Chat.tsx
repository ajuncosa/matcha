import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputGroup } from "@/components/ui/input-group";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import AuthContext from "@/contexts/AuthContextProvider";
import ChatContext from "@/contexts/ChatContextProvider";
import { ArrowLeft, SendHorizonal } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";

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

export default function ChatPage() {
    const {user} = useContext(AuthContext);
    const {chats, sendMessage, setMessagesAsViewed} = useContext(ChatContext);
    const [hiddenChat, setHiddenChat] = useState<boolean>(true);
    const [currentChat, setCurrentChat] = useState(0);
    const [inputMessage, setInputMessage] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    
    async function changeChat(index: number) {
        // Mark messages of selected chat as viewed
        let unreadMessagesIds: number[] = chats[index].messages.filter((message) => {
            if (message.sender != user.id && !message.viewed_at)
                return true;
        }).map((msg) => msg.id);

        // Set new chat messages as viewed
        if (unreadMessagesIds.length > 0)
            setMessagesAsViewed(index, unreadMessagesIds);

        // Set the chat
        setHiddenChat(false);
        setCurrentChat(index);
    }

    async function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInputMessage(e.target.value);
    }

    async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            onSendMessageClick();
        }
    }

    async function onSendMessageClick() {
        if (inputMessage.length == 0) return;
        
        sendMessage(chats[currentChat].otherUser.id, inputMessage);
        setInputMessage("");
    }

    useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    });

    return (
        <div className="w-full flex gap-2 h-full">
            <div className={`w-full lg:w-1/3 lg:flex flex-col gap-2 ${hiddenChat ? "flex" : "hidden"}`}>
                {
                    chats.map((chat, index) => 
                        <Item key={index} variant="outline" className="cursor-pointer" onClick={() => changeChat(index)}>
                            <ItemMedia>
                                <Avatar className="rounded-lg size-10">
                                    <AvatarImage src="https://github.com/evilrabbit.png" />
                                    <AvatarFallback>ER</AvatarFallback>
                                </Avatar>
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>{chat.otherUser.name} {chat.otherUser.lastname}</ItemTitle>
                                <ItemDescription>Last seen 5 months ago</ItemDescription>
                            </ItemContent>
                            {(chat.unreadMessages > 0) && 
                                <ItemActions>
                                    <Badge variant="destructive">{chat.unreadMessages}</Badge>
                                </ItemActions>
                            }
                        </Item>
                    )
                }
            </div>
            <div className={`w-full h-full lg:w-2/3 lg:block ${hiddenChat ? "hidden" : "block"}`}>
                <div className="w-full flex-1 h-full">
                    <Card className="w-full pt-0 rounded-md h-full">
                        <CardHeader className="p-0 m-0">
                            <Item className="px-6">
                                <ItemMedia className="flex items-center">
                                    <Button className="cursor-pointer lg:hidden" variant="outline" onClick={() => setHiddenChat(true)}><ArrowLeft/></Button>
                                    <Avatar className="rounded-lg size-10 cursor-pointer">
                                        <AvatarImage src="https://github.com/evilrabbit.png" />
                                        <AvatarFallback>ER</AvatarFallback>
                                    </Avatar>
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle className="cursor-pointer">{chats[currentChat] ? `${chats[currentChat].otherUser.name} ${chats[currentChat].otherUser.lastname}` : null}</ItemTitle>
                                </ItemContent>
                            </Item>
                        </CardHeader>
                        <CardContent className="w-full">
                            <ScrollArea className="h-98 w-full rounded-md border" ref={scrollAreaRef}>
                                <div className="flex flex-col gap-2 p-3">
                                {
                                    (chats[currentChat]) &&
                                    chats[currentChat].messages.map((msg) =>
                                        <div className={`flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm ${ (msg.receiver == user.id) ? "bg-muted" : "bg-primary text-primary-foreground ml-auto"}`}>
                                            {msg.message}
                                        </div>
                                    )
                                }
                                </div>
                            </ScrollArea>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                            <ButtonGroup className="w-full">
                                <Input value={inputMessage} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Type message..." />
                                <Button className="cursor-pointer" variant="outline" aria-label="Type" onClick={onSendMessageClick}>
                                    <SendHorizonal />
                                </Button>
                            </ButtonGroup>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}