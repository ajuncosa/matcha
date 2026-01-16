import type { IUserRepository } from "@/core/user/IUserRepository";
import type { IPasswordHasher } from "@/core/user/IPasswordHasher";
import { UserUseCases } from "@/app/user/UserUseCases";
import UserRepositoryPostgres from "@/infra/repositories/UserRepositoryPostgres";
import { BcryptPasswordHasher } from "@/infra/crypto/BcryptPasswordHasher";
import UserRouter from "@/infra/http/routers/UserRouter";
import { isAuthenticated } from "@/infra/http/Middlewares";
import AuthRouter from "@/infra/http/routers/AuthRouter";

import express, { type RequestHandler } from "express";
import bodyParser from "body-parser";
import { Server as SocketIOServer } from "socket.io";
import { createServer, type Server as HTTPServer } from 'http';
import { Pool } from "pg";
import session, { MemoryStore } from "express-session";
import { SocketRegistrySocketIO } from "./infra/socket/SocketRegistrySocketIO";

const pgPool: Pool = new Pool();

const passwordHasher: IPasswordHasher = new BcryptPasswordHasher();
const userRepository: IUserRepository = new UserRepositoryPostgres(pgPool);
const userUseCases: UserUseCases = new UserUseCases(userRepository, passwordHasher);
const authRouter: AuthRouter = new AuthRouter(userUseCases);
const userRouter: UserRouter = new UserRouter(userUseCases);

const expressApp = express();
const expressSession: RequestHandler = session({
    secret: [process.env.COOKIESESSIONSECRETKEY!], // FIXME: remove exclamation
    resave: false,
    //rolling: true,
    saveUninitialized: false,
    store: new MemoryStore, // FIXME: use a production one
    cookie: {
        httpOnly: true,
        //secure: true, // cookie only sent through HTTPS
        //secure: process.env.NODE_ENV === "production",
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
})

expressApp.use(bodyParser.json());
expressApp.use(expressSession);

// Express routes
expressApp.use("/auth", authRouter.getRouter());
expressApp.use("/user", isAuthenticated, userRouter.getRouter());

// Socket management
const httpServer: HTTPServer = createServer(expressApp);
const socketServer: SocketIOServer = new SocketIOServer(httpServer, {
  serveClient: false
});

socketServer.engine.use(expressSession);

const socketRegistry = new SocketRegistrySocketIO(socketServer);

httpServer.listen(3000, () => {
    console.log(`Server running on http://localhost:${3000}`);
});
