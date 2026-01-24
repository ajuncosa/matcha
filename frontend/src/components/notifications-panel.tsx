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
                    <div className="flex w-full max-w-lg flex-col gap-6">
                        {notifications.map(notification =>{
                            return (
                                <Item variant="outline">
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