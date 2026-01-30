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
import { SocketRegistrySocketIO } from "@/infra/socket/SocketRegistrySocketIO";
import { NotificaitonRouter } from "@/infra/http/routers/NotificationRouter";
import { NotificationUseCases } from "@/app/notifications/NotificationUseCases";
import type { INotificationRespository } from "@/core/notification/INotificationRepository";
import { NotificationRepositoryPostgres } from "@/infra/repositories/NotificationRepositoryPostgres";
import { NotificationService } from "./app/notifications/NotificationService";
import type { ITagsRepository } from "./core/tag/ITagsRepository";
import type { ITagsService } from "./core/tag/TagsService";
import { TagService } from "./app/tag/TagService";
import { TagRepositoryPostgres } from "./infra/repositories/TagRepositoryPostgres";

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

const pgPool: Pool = new Pool();

// Socket management
const httpServer: HTTPServer = createServer(expressApp);
const socketServer: SocketIOServer = new SocketIOServer(httpServer, {
  serveClient: false
});

const socketRegistry = new SocketRegistrySocketIO(socketServer);

// Repositories
const userRepository: IUserRepository = new UserRepositoryPostgres(pgPool);
const notificationRepository: INotificationRespository = new NotificationRepositoryPostgres(pgPool);
const tagRespository: ITagsRepository = new TagRepositoryPostgres(pgPool);

// Services
const passwordHasher: IPasswordHasher = new BcryptPasswordHasher();
const notificationService: NotificationService = new NotificationService(socketRegistry, notificationRepository);
const tagsService: ITagsService = new TagService(tagRespository);

// Use Cases
const userUseCases: UserUseCases = new UserUseCases(userRepository, passwordHasher, notificationService, tagsService);
const notificationUserCases: NotificationUseCases = new NotificationUseCases(notificationRepository);

// Routers
const authRouter: AuthRouter = new AuthRouter(userUseCases);
const userRouter: UserRouter = new UserRouter(userUseCases);
const notificationsRouter: NotificaitonRouter = new NotificaitonRouter(notificationUserCases);


expressApp.use(bodyParser.json());
expressApp.use(expressSession);

socketServer.engine.use(expressSession);

// Express routes
expressApp.use("/auth", authRouter.getRouter());
expressApp.use("/user", isAuthenticated, userRouter.getRouter());
expressApp.use("/notification", isAuthenticated, notificationsRouter.getRouter());

httpServer.listen(3000, () => {
    console.log(`Server running on http://localhost:${3000}`);
});
