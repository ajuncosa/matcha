import { type EventCallback, type EventName, type IUserSocketRegistry } from "@/core/socket/IUserSocketRegistry";
import { type Socket, type SocketId } from "@/core/socket/Socket";
import type { IUserRepository } from "@/core/user/IUserRepository";
import { type UserId } from "@/core/user/User";
import { Server as SocketIOServer, Socket as IORawSocket, type DisconnectReason } from "socket.io";


class IoSocket implements Socket {
    id: SocketId;
    userId: UserId;
    ioSocket: IORawSocket;

    constructor(ioSocket: IORawSocket, id: SocketId ,userId: UserId) {
        this.ioSocket = ioSocket;
        this.userId = userId;
        this.id = id;
    }

    send(event: string, data: any): boolean {
        return this.ioSocket.emit(event, data);
    }

    disconnect() {
        this.ioSocket.disconnect();
    }
}

interface EventSubscriber {
    event: EventName;
    callback: EventCallback;
}

export class SocketRegistrySocketIO implements IUserSocketRegistry {
    private server: SocketIOServer;
    private usersSocketsMap: Map<UserId, Socket> = new Map();
    private userRepo: IUserRepository;
    private subscribers: Map<EventName, EventSubscriber[]> = new Map;

    constructor(socketServer: SocketIOServer, userRepo: IUserRepository) { 
        this.server = socketServer;
        this.server.on('connection', (socket: IORawSocket) => 
            this.onSocketConnection(socket)
        );

        this.userRepo = userRepo;
    }

    private onSocketConnection(socket: IORawSocket) {
        const userId = socket.request?.session?.userId; // No clue how to type this

        console.log("[SOCKET]: CONNECTED", socket.id, "User:", userId);

        if (!userId) {
            socket.disconnect();
            console.log("[SOCKET]: DISCONNECTED", socket.id, "User:", userId, "reason: User not authenticated");
            return;
        }

        const userSocket: Socket | undefined = this.usersSocketsMap.get(userId);
        if (userSocket) {
            userSocket.disconnect();
            console.log("[SOCKET]: WILL DISCONNECT", userSocket.id, "User:", userId, "reason: User already has a socket");
        }

        const userSock: Socket = new IoSocket(socket, socket.id, userId);
        this.usersSocketsMap.set(userId, userSock);
        
        //WARNING: this fucker sometimes does not work when the server restars bc of modified files.
        // YOU HAVE TO RESTART THE PROCESS IN THE TERMINAL "CTRL+C and the bun run dev"
        socket.onAny((event, payload: any) => this.onAnyEvent(event, userSock, payload));

        socket.on('disconnect', (reason: DisconnectReason) => 
            this.onSocketDisconnection(socket, reason)
        );
    }

    private onSocketDisconnection(socket: IORawSocket, reason: DisconnectReason) {
        const userId = socket.request?.session?.userId; // No clue how to type this

        console.log("[SOCKET]: DISCONNECTED", socket.id, "User:", userId, "reason:", reason);

        if (userId) this.usersSocketsMap.delete(userId);

        // Mark user last_connection
        this.userRepo.setUserLastConnection(userId);
    }

    private onAnyEvent(event: EventName, socket: Socket, payload: any) {
        const subscribers: EventSubscriber[] | undefined = this.subscribers.get(event);

        console.log("any event", event, socket.id, payload);

        if (!subscribers)
            return;

        subscribers.forEach((sub) => {
            sub.callback(socket, payload);
        });
    }

    subscribeToEvent(eventName: EventName, callback: EventCallback) {
        const subscriber: EventSubscriber[] | undefined = this.subscribers.get(eventName);

        if (subscriber) {
            subscriber.push({
                event: eventName,
                callback: callback
            });
        }
        else {
            this.subscribers.set(eventName, [{
                event: eventName,
                callback: callback
            }]);
        }
    }

    getUserSocket(userId: UserId): Socket | null {
        const sock: Socket | undefined = this.usersSocketsMap.get(userId);

        return (sock) ? sock : null
    }
}
