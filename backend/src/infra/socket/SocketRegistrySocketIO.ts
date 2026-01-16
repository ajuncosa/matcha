import { type IUserSocketRegistry, type Socket, type SocketId } from "@/core/socket/IUserSocketRegistry"
import { User, type UserId } from "@/core/user/User";
import { Server as SocketIOServer, Socket as IORawSocket, type DisconnectReason, type DefaultEventsMap } from "socket.io";

interface SocketSessionData {
    request: {
        session: null | { userId: UserId }
    }
}

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

export class SocketRegistrySocketIO implements IUserSocketRegistry {
    private server: SocketIOServer;
    private usersSocketsMap: Map<UserId, Socket> = new Map();

    constructor(socketServer: SocketIOServer) { 
        this.server = socketServer;
        this.server.on('connection', (socket: IORawSocket) => 
            this.onSocketConnection(socket)
        );
    }

    onSocketConnection(socket: IORawSocket) {
        const userId = socket.request?.session?.userId;

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

        this.usersSocketsMap.set(userId, new IoSocket(socket, socket.id, userId));
        socket.on('disconnect', (reason: DisconnectReason) => 
            this.onSocketDisconnection(socket, reason)
        );
    }

    onSocketDisconnection(socket: IORawSocket, reason: DisconnectReason) {
        const userId = socket.request?.session?.userId;

        console.log("[SOCKET]: DISCONNECTED", socket.id, "User:", userId, "reason:", reason);

        if (userId) this.usersSocketsMap.delete(userId);
    }

    getUserSocket(userId: UserId): Socket | null {
        const sock: Socket | undefined = this.usersSocketsMap.get(userId);

        return (sock) ? sock : null
    }

}
