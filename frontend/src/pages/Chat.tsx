import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { ArrowLeft, SendHorizonal } from "lucide-react";
import { useState } from "react";

// GET /connections
const connections = [
    {
        id: 1,
        name: "Adrian Pavel",
    },
    {
        id: 2,
        name: "Ana Juncosa",
    },
    {
        id: 3,
        name: "Papa Noel",
    }
];

// GET /messages/[user_id]
const messages = [
    {
        owner: 1,
        message: "Hola"
    },
    {
        owner: 2,
        message: "Caracola"
    },
    {
        owner: 1,
        message: "Guapa"
    },
    {
        owner: 2,
        message: "Tu mas"
    },
    {
        owner: 2,
        message: "hijoputas"
    }
]

export default function ChatPage() {
    const [hiddenChat, setHiddenChat] = useState<boolean>(true);

    return (
        
        <div className="w-full flex gap-2">
            <div className={`w-full lg:w-1/3 lg:flex flex-col gap-2 ${hiddenChat ? "flex" : "hidden"}`}>
                {
                    connections.map((connection) => 
                        <Item variant="outline" className="cursor-pointer" onClick={() => setHiddenChat(false)}>
                            <ItemMedia>
                                <Avatar className="rounded-lg size-10">
                                    <AvatarImage src="https://github.com/evilrabbit.png" />
                                    <AvatarFallback>ER</AvatarFallback>
                                </Avatar>
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>{connection.name}</ItemTitle>
                                <ItemDescription>Last seen 5 months ago</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Badge variant="destructive">1</Badge>
                            </ItemActions>
                        </Item>
                    )
                }
            </div>
            <div className={`w-full lg:w-2/3 lg:block ${hiddenChat ? "hidden" : "block"}`}>
                <Card className="w-full pt-0 rounded-md">
                    <CardHeader className="p-0 m-0">
                        <Item className="px-4">
                            <ItemMedia className="flex items-center">
                                <Button className="cursor-pointer lg:hidden" variant="outline" onClick={() => setHiddenChat(true)}><ArrowLeft/></Button>
                                <Avatar className="rounded-lg size-10 cursor-pointer">
                                    <AvatarImage src="https://github.com/evilrabbit.png" />
                                    <AvatarFallback>ER</AvatarFallback>
                                </Avatar>
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle className="cursor-pointer">Evil Rabbit</ItemTitle>
                            </ItemContent>
                        </Item>
                    </CardHeader>
                    <CardContent className="px-5 flex flex-col gap-2">
                        {
                            messages.map((msg) =>
                                <div className={`flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm ${ (msg.owner == 1) ? "bg-muted" : "bg-primary text-primary-foreground ml-auto"}`}>
                                    {msg.message}
                                </div>
                            )
                        }
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <ButtonGroup className="w-full">
                            <Input placeholder="Say hello..." />
                            <Button variant="outline" aria-label="Type">
                                <SendHorizonal />
                            </Button>
                        </ButtonGroup>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}