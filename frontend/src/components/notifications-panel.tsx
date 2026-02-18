import { Bell, Check, Eye, MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { Badge } from "./ui/badge"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet"
import {
    Item,
    ItemActions,
    ItemContent,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item"
import { Button } from "./ui/button";
import { useContext } from "react";
import NotificationsContext from "@/contexts/NotificationsContextProvider";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export function NotificationsPanel() {
    const { notifications, markAsViewed, markAllAsViewed } = useContext(NotificationsContext);

    return (
        <Sheet>
            <SheetTrigger className="cursor-pointer relative flex gap-1">
                <Bell />
                {notifications.length > 0 &&<Badge variant="destructive">{notifications.length}</Badge>}
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Notifications</SheetTitle>
                </SheetHeader>

                <div className="px-4">
                    <div className="flex w-full max-w-lg flex-col gap-2 scroll-auto">
                        <ScrollArea className="h-[calc(100vh-12rem)] w-full">
                            <div className="flex w-full max-w-lg flex-col gap-2">
                                {notifications.map((notification, index) =>{
                                    return (
                                        <Item key={index} variant="outline">
                                            <ItemMedia variant="icon">
                                                {notification.type == "like" && <ThumbsUp />}
                                                {notification.type == "message" && <MessageCircle />}
                                                {notification.type == "profile_view" && <Eye />}
                                                {notification.type == "unlike" && <ThumbsDown />}
                                            </ItemMedia>
                                            <ItemContent>
                                                <ItemTitle>{notification.text}</ItemTitle>
                                            </ItemContent>
                                            <ItemActions>
                                                <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => markAsViewed(notification.id)}>
                                                    <Check/>
                                                </Button>
                                            </ItemActions>
                                        </Item>
                                        )
                                    })}
                            </div>
                            <ScrollBar />
                        </ScrollArea>
                        
                    </div>
                </div>

                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline" className="cursor-pointer" onClick={() => markAllAsViewed()}>Clear all</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}