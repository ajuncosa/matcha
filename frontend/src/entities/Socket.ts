import { createContext, type Dispatch, type SetStateAction } from 'react';
import { io, Socket as IOSocket } from 'socket.io-client';

class Socket {
    socket: IOSocket | null = null;

    connect() {
        this.socket = io("http://localhost");
    }
}

export interface SocketContextPayload {
    socket: Socket | null;
}

export const SocketContext = createContext<SocketContextPayload>({
    socket: null
});
