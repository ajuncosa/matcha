import { createContext, useContext, useEffect, useRef } from "react";
import { io, type Socket as SocketIO } from "socket.io-client";
import AuthContext from "./AuthContextProvider";
import { SOCKET_URL } from "@/lib/config";

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
        // Idempotent: never create a second socket. A duplicate socket would race
        // the first one (the backend keeps only one per user) and, worse, could be
        // left without the onAny bridge below — silently dropping every server
        // event (e.g. chat:message that drives the unread badge).
        if (this.socket) return;
        this.socket = io(this.url);
        this.isConnected = true;
        // Bridge every incoming server event to our own subscriber registry.
        // Attaching it here (not in the provider effect) guarantees any socket we
        // create always has it, no matter who triggered the connect.
        this.socket.onAny((event, args) => this.emitEventFromServer(event, args));
        // socket.io reconnects on its own after a dropped transport. onAny does
        // NOT fire for the reserved 'connect' event, so bridge it explicitly as a
        // synthetic event: consumers can resync any state they may have missed
        // while the connection was down (e.g. refetch chats for the unread badge).
        this.socket.on("connect", () => this.emitEventFromServer("socket:connect", null));
    }

    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
        this.isConnected = false;
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

const userSocket: UserSocket = new UserSocket(SOCKET_URL);
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
        // connect() is idempotent and attaches the onAny bridge itself, so the
        // connection lifecycle is owned entirely here (driven by login state) —
        // no component should call connect() manually.
        checkSocketConnection();
    }, [user.loggedIn]);

    return (
        <SocketContext value={socket.current}>
            {children}
        </SocketContext>
    )
}

export default SocketContext;