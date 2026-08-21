import { createContext, useContext, useEffect, useState, type ReactElement } from "react";
import AuthContext from "./AuthContextProvider";
import SocketContext from "./SocketContextProvider";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";

export type NotificationType = 'message' | 'like' | 'profile_view' | 'unlike';

export interface Notification {
    id: number;
    producer: number;
    target: number;
    type: NotificationType;
    createdAt: Date;
    viewedAt: Date | null;
    text: string;
}

interface NotificationsContextType {
    notifications: Notification[];
    addNotification: CallableFunction;
    markAsViewed: CallableFunction;
    markAllAsViewed: CallableFunction;
}

const defaultValue: NotificationsContextType = {
    notifications: [],
    addNotification: () => {},
    markAsViewed: () => {},
    markAllAsViewed: () => {}
};

const NotificationsContext = createContext<NotificationsContextType>(defaultValue);

export function NotificationsContextProvider({children}: {children: ReactElement}) {
    const { user } = useContext(AuthContext);
    const socket = useContext(SocketContext);
    const [notifications, setNotifications] = useState<Notification[]>([]);


    function addNotification(notification: Notification) {
        setNotifications(prev => [...prev, notification]);
        toast(notification.text);
    }

    async function fetchNotificationsAsViewed(notificationsIds: number[]): Promise<number> {
        const request = await fetch(`${API_URL}/notification/mark-as-viewed`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                notificationsIds: notificationsIds
            })
        });

        return request.status;
    }

    async function markAsViewed(notificationId: number) {
        const status: number = await fetchNotificationsAsViewed([notificationId]);

        if (status != 200) {
            console.error(`Cannot mark notification ${notificationId} as viewed`);
            return;
        }

        const newNotifications = notifications.filter((notif) => {
            return notif.id != notificationId;
        });

        setNotifications(newNotifications);
    }

    async function markAllAsViewed() {
        const notificationsIds: number[] = notifications.map((notif) => notif.id);

        const status: number = await fetchNotificationsAsViewed(notificationsIds);

         if (status != 200) {
            console.error("Cannot mark all notifications as viewed");
            return;
        }

        setNotifications([]);
    }

    async function fetchUnreadNotifications() {
        const request = await fetch(`${API_URL}/notification/new`);
        const requestBody = await request.json();
        
        setNotifications(requestBody);
    }

    useEffect(() => {
        if (user.loggedIn) {
            fetchUnreadNotifications();
            const likeSubId = socket.subscribeToEvent('notification:like', "NotificationsContextProvider", (n) => addNotification(n));
            const unlikeSubId = socket.subscribeToEvent('notification:unlike', "NotificationsContextProvider", (n) => addNotification(n));
            const profileViewSubId = socket.subscribeToEvent('notification:profile-view', "NotificationsContextProvider", (n) => addNotification(n));
            const messageSubId = socket.subscribeToEvent('notification:message', "NotificationsContextProvider", (n) => addNotification(n));

            return () => {
                socket.unsubscribeFromEvent(likeSubId, 'notification:like', "NotificationsContextProvider");
                socket.unsubscribeFromEvent(unlikeSubId, 'notification:unlike', "NotificationsContextProvider");
                socket.unsubscribeFromEvent(profileViewSubId, 'notification:profile-view', "NotificationsContextProvider");
                socket.unsubscribeFromEvent(messageSubId, 'notification:message', "NotificationsContextProvider");
            }
        }
    }, [user.loggedIn]);

    return (
        <NotificationsContext value={{notifications, addNotification, markAsViewed, markAllAsViewed}}>
            {children}
        </NotificationsContext>
    )
}

export default NotificationsContext;