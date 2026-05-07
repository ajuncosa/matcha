import { createContext, useContext, useEffect, useRef } from "react";
import { io, type Socket as SocketIO } from "socket.io-client";
import AuthContext from "./AuthContextProvider";

type EventCallbackFn = (payload: any) => void;

interface EventSubscriber {
    id: number;
    subscriber: string;
    callback: EventCallbackFn;
};

class UserSocket {
    socket: SocketIO | null = null;
    url: string;
    isConnected: boolean = false;
    eventsSubscribers: Map<string, EventSubscriber[]> = new Map();
    subscriberIdCounter: number = 0;

    constructor(url: string) {
        this.url = url;
    }

    connect() {
        this.socket = io(this.url);
        this.isConnected = true;
    }

    disconnect() {
        this.socket?.disconnect();
    }


    subscribeToEvent(event: string, subscriberName: string, callback: EventCallbackFn): number {
        const eventSubs = this.eventsSubscribers.get(event);
        const eventNumber = this.subscriberIdCounter;
        if (!eventSubs) {
            this.eventsSubscribers.set(event, [
                {
                    id: eventNumber, 
                    subscriber: subscriberName, 
                    callback: callback
                }
            ]);
        } else {
            eventSubs.push({
                id: eventNumber, 
                subscriber: subscriberName, 
                callback: callback
            });
        }
        
        this.subscriberIdCounter += 1;
        return eventNumber;
    }

    unsubscribeFromEvent(subscriberId: number, event: string, subscriberName: string): void {
        const eventSubs = this.eventsSubscribers.get(event);
        if (!eventSubs) return;

        const subscriberIndex: number = eventSubs.findIndex((event) => {
            if (event.id == subscriberId && event.subscriber == subscriberName)
                return true;
            return false;
        });

        if (subscriberIndex === -1) return;
        
        eventSubs.splice(subscriberIndex, 1);
        
        if (eventSubs.length === 0) {
            this.eventsSubscribers.delete(event);
        }

        eventSubs.splice(subscriberIndex, 1);
    }

    emitEventFromServer(event: string, payload: any): void {
        const eventSubs = this.eventsSubscribers.get(event);
        eventSubs?.forEach(sub => {
            sub.callback(payload);
        });
    }

    emitEventToServer(event: string, payload: any): void {
        this.socket?.emit(event, payload);
    }
}

//TODO: Move this url to .env file
const userSocket: UserSocket = new UserSocket("http://localhost");
const SocketContext = createContext<UserSocket>(userSocket);

export function SocketContextProvider({children}: {children: React.ReactElement}) {
    const { user } = useContext(AuthContext);
    const socket = useRef<UserSocket>(userSocket);

    function checkSocketConnection() {
        if (user.loggedIn) {
            socket.current.connect();
        }
    }

    useEffect(() => {
        checkSocketConnection();
        //socket.current.socket?.on('notification-like', onLikeNotification);
        socket.current.socket?.onAny((event, args) => socket.current.emitEventFromServer(event, args));
    }, [user.loggedIn]);

    return (
        <SocketContext value={socket.current}>
            {children}
        </SocketContext>
    )
}

export default SocketContext;