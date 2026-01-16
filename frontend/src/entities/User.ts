import { io, Socket as IOSocket } from 'socket.io-client';

export class Socket {
    url: string;
    socket: IOSocket | null = null;

    constructor(url: string) {
        this.url = url;
    }

    connect() {
        this.socket = io(this.url);
    }

    disconnect() {
        if (this.socket) this.socket.disconnect();
    }
}

export class User {
    name: string;
    lastname: string;
    private profileCompleted = false;
    socket: Socket | null = null
    
    private constructor(name: string, lastname: string, profileCompleted: boolean) {
        this.name = name;
        this.lastname = lastname;
        this.profileCompleted = profileCompleted;
    }

    hasProfileCompleted(): boolean {
        return this.profileCompleted;
    }

    static async login(email: string, password: string): Promise<User | null> {
        const resp : Response = await fetch("http://localhost/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (resp.status != 200) {
            return null;
        }
        else {
            const respJson = await resp.json();

            let profileCompleted = false;
            if (respJson["profileCompleted"] == true) {
                profileCompleted = true;
            }

            let user: User = new User("", "", profileCompleted);
            this.saveToLocalStorage(user);

            user.connectSocket();

            return user;
        }
    }

    async logout(): Promise<void> {
        const resp : Response = await fetch("http://localhost/api/auth/logout", {
            method: "POST"
        });

        if (resp.status != 200) {
            console.log("ERROR: cannot log out");
            return;
        }

        localStorage.clear();
        this.disconnectSocket();
    }

    static async checkSession(): Promise<User | null> {
        const localUser = localStorage.getItem('user');

        if (!localUser) {
            return null;
        }

        const sessionCheck = await fetch('http://localhost/api/auth/check-session');
        console.log("session check", sessionCheck.status);
        if (sessionCheck.status != 200) {
            localStorage.removeItem('user');
            return null;
        }
        const payload = await sessionCheck.json();
        const jsonUser: User = JSON.parse(localUser);

        let user = new User(jsonUser.name, jsonUser.lastname, payload["profileCompleted"]);
        user.connectSocket();

        return user;
    }

    static async saveToLocalStorage(user: User) {
        user.socket = null;
        const userJson: string = JSON.stringify(user);
        localStorage.setItem('user', userJson);
    }

    static async getFromLocalStorage() {
        //TODO: implement this
    }

    connectSocket() {
        this.socket = new Socket("http://localhost");
        this.socket.connect();
    }

    disconnectSocket() {
        console.log("disc");
        console.log(this.socket);
        if (this.socket) this.socket.disconnect();
    }
}