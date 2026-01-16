import { type IUserSocketRegistry, type Socket } from "@/core/socket/IUserSocketRegistry"
import { type UserId } from "@/core/user/User";
import { Server as SocketIOServer, Socket as IORawSocket, type DisconnectReason, type DefaultEventsMap } from "socket.io";

interface SocketSessionData {
    request: {
        session: null | { userId: UserId }
    }
}

type IOSocketWithSession = IORawSocket<
  DefaultEventsMap,
  DefaultEventsMap,  
  DefaultEventsMap,
  SocketSessionData
>;

class IoSocket implements Socket {
    userId: UserId;
    ioSocket: IOSocketWithSession;

    constructor(ioSocket: IOSocketWithSession, userId: UserId) {
        this.ioSocket = ioSocket;
        this.userId = userId;
    }

    send(event: string, data: any): boolean {
        return this.ioSocket.emit(event, data);
    }
}

export class SocketRegistrySocketIO implements IUserSocketRegistry {
    private server: SocketIOServer;
    private usersSocketsMap: Map<UserId, Socket> = new Map();

    constructor(socketServer: SocketIOServer) { 
        this.server = socketServer;
        this.server.on('connection', (socket: IOSocketWithSession) => 
            this.onSocketConnection(socket)
        );
    }

    onSocketConnection(socket: IOSocketWithSession) {
        const userId = socket.request?.session?.userId;

        //console.log(socket.request);

        console.log("[SOCKET]: CONNECTED", socket.id, "User:", userId);

        if (!userId) {
            socket.disconnect();
            console.log("[SOCKET]: DISCONNECTED", socket.id, "User:", userId, "reason: User not authenticated");
            return;
        }
            
        this.usersSocketsMap.set(userId, new IoSocket(socket, userId));
        
        socket.on('disconnect', (reason: DisconnectReason) => 
            this.onSocketDisconnection(socket, reason)
        );
    }

    onSocketDisconnection(socket: IOSocketWithSession, reason: DisconnectReason) {
        const userId = socket.data?.request?.session?.userId;

        console.log("[SOCKET]: DISCONNECTED", socket.id, "User:", userId, "reason:", reason);

        if (userId) this.usersSocketsMap.delete(userId);
    }

    getUserSocket(userId: UserId): Socket | null {
        const sock: Socket | undefined = this.usersSocketsMap.get(userId);

        return (sock) ? sock : null
    }

}
