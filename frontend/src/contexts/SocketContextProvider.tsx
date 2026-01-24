import { createContext, useContext, useEffect, useRef } from "react";
import { io, type Socket as SocketIO } from "socket.io-client";
import AuthContext from "./AuthContextProvider";
import NotificationsContext from "./NotificationsContextProvider";

class UserSocket {
    socket: SocketIO | null = null;
    url: string;
    isConnected: boolean = false;

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
}

//TODO: Move this url to .env file
let userSocket: UserSocket = new UserSocket("http://localhost");
const SocketContext = createContext<UserSocket>(userSocket);

export function SocketContextProvider({children}: {children: React.ReactElement}) {
    const { user } = useContext(AuthContext);
    const { addNotification } = useContext(NotificationsContext);
    const socket = useRef<UserSocket>(userSocket);

    function checkSocketConnection() {
        if (user.loggedIn) {
            console.log("connect socket");
            socket.current.connect();
        }
    }

    function onLikeNotification(payload: string) {
        addNotification(payload);
    }

    useEffect(() => {
        checkSocketConnection();
        socket.current.socket?.on('notification-like', onLikeNotification);
    }, [user.loggedIn]);

    return (
        <SocketContext value={socket.current}>
            {children}
        </SocketContext>
    )
}

export default SocketContext;