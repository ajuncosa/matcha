import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { SendHorizonal } from "lucide-react";

export default function ChatPage() {
    return (
        <div className="w-full flex gap-2">
            <div className="w-1/3 flex flex-col gap-2">
                <Item variant="outline" className="cursor-pointer">
                    <ItemMedia>
                        <Avatar className="size-10">
                            <AvatarImage src="https://github.com/evilrabbit.png" />
                            <AvatarFallback>ER</AvatarFallback>
                        </Avatar>
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Evil Rabbit</ItemTitle>
                        <ItemDescription>Last seen 5 months ago</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        
                    </ItemActions>
                </Item>
                <Item variant="outline" className="cursor-pointer">
                    <ItemMedia>
                        <Avatar className="size-10">
                            <AvatarImage src="https://github.com/evilrabbit.png" />
                            <AvatarFallback>ER</AvatarFallback>
                        </Avatar>
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Adri Rabbit</ItemTitle>
                        <ItemDescription>Last seen 5 months ago</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <Badge variant="destructive">1</Badge>
                    </ItemActions>
                </Item>
                <Item variant="outline" className="cursor-pointer">
                    <ItemMedia>
                        <Avatar className="size-10">
                            <AvatarImage src="https://github.com/evilrabbit.png" />
                            <AvatarFallback>ER</AvatarFallback>
                        </Avatar>
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Good Rabbit</ItemTitle>
                        <ItemDescription>Last seen 5 months ago</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <Badge variant="destructive">6</Badge>
                    </ItemActions>
                </Item>
            </div>
            <div className="w-2/3">
                <Card className="w-full pt-0 rounded-md">
                    <CardHeader className="p-0 m-0">
                        <Item className="px-4">
                            <ItemMedia>
                                <Avatar className="size-10 cursor-pointer">
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
                        <div className="flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted">
                            Hi, how can I help you today?
                        </div>
                        <div className="flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-primary text-primary-foreground ml-auto">
                            Hey, I'm having trouble with my account.
                        </div>
                        <div className="flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted">
                            okay 
                        </div>
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