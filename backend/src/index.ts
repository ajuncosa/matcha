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
import type { ITagsService } from "./core/tag/ITagsService";
import { TagService } from "./app/tag/TagService";
import { TagRepositoryPostgres } from "./infra/repositories/TagRepositoryPostgres";
import ChatRouter from "./infra/http/routers/ChatRouter";
import ChatUseCases from "./app/chat/ChatUseCases";
import type IMessageRepository from "./core/chat/IMessageRepository";
import MessageRepositoryPosgres from "./infra/repositories/MessageRepositoryPostgres";
import ChatService from "./app/chat/ChatService";
import type { ILikeRepository } from "./core/like/ILikeRepository";
import { LikeRepositoryPostgres } from "./infra/repositories/LikeRepositoryPostgres";
import type { IPhotoService } from "./core/photos/IPhotoService";
import { PhotoService } from "./app/photos/PhotoService";
import PhotoRepositoryPostgres from "./infra/repositories/PhotoRepository";
import type { IPhotoRepository } from "./core/photos/IPhotoRepository";
import NodeMailerEmailSender from "./infra/email/NodeMailerEmailService";
import type { EmailSenderConfiguration } from "./core/email/IEmailSender";
import EmailVerificationService from "./app/email/EmailVerificationService";
import type { ISearchRepository } from "./core/search/ISearchRepository";
import { SearchUseCases } from "./app/search/SearchUseCases";
import SearchRepositoryPostgres from "./infra/repositories/SearchRepositoryPostgres";
import SearchRouter from "./infra/http/routers/SearchRouter";
import { SuggestionService } from "./app/suggestion/SuggestionService";
import type { ISuggestionRepository } from "./core/suggestion/ISuggestionRepository";
import { SuggestionRepositoryPostgres } from "./infra/repositories/SuggestionRespostiroyPostgres";
import type { IProfileVisitRepository } from "./core/profileVisit/IProfileVisitRepository";
import { ProfileVisitRepositoryPostgres } from "./infra/repositories/ProfileVisitRepositoryPostgres";
import type { IBlockRepository } from "./core/block/IBlockRepository";
import { BlockRepositoryPostgres } from "./infra/repositories/BlockRepositoryPostgres";
import type { IReportRepository } from "./core/report/IReportRepository";
import { ReportRepositoryPostgres } from "./infra/repositories/ReportRepositoryPostgres";
import { CommonPasswordRepositoryPostgres } from "./infra/repositories/CommonPasswordRepositoryPostgres";
import type { ICommonPasswordRepository } from "@/core/password/ICommonPasswordRepository";

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

// Repositories
const userRepository: IUserRepository = new UserRepositoryPostgres(pgPool);
const notificationRepository: INotificationRespository = new NotificationRepositoryPostgres(pgPool);
const tagRespository: ITagsRepository = new TagRepositoryPostgres(pgPool);
const messageRepository: IMessageRepository = new MessageRepositoryPosgres(pgPool);
const likeRepository: ILikeRepository = new LikeRepositoryPostgres(pgPool);
const photoRespository: IPhotoRepository = new PhotoRepositoryPostgres(pgPool);
const searchRepository: ISearchRepository = new SearchRepositoryPostgres(pgPool);
const suggestionRepository: ISuggestionRepository = new SuggestionRepositoryPostgres(pgPool);
const profileVisitRepository: IProfileVisitRepository = new ProfileVisitRepositoryPostgres(pgPool);
const blockRepository: IBlockRepository = new BlockRepositoryPostgres(pgPool);
const reportRepository: IReportRepository = new ReportRepositoryPostgres(pgPool);
const commonPasswordRepository: ICommonPasswordRepository = new CommonPasswordRepositoryPostgres(pgPool);

//Email Senders
const nodeMailerConfig: EmailSenderConfiguration = {
    host: 'mailpit',
    port: 1025,
    secure: false,
};
const nodeMailerEmailSender: NodeMailerEmailSender = new NodeMailerEmailSender(nodeMailerConfig);

// Socket management
const httpServer: HTTPServer = createServer(expressApp);
const socketServer: SocketIOServer = new SocketIOServer(httpServer, {
  serveClient: false
});

const socketRegistry = new SocketRegistrySocketIO(socketServer, userRepository);

// Services
const passwordHasher: IPasswordHasher = new BcryptPasswordHasher();
const notificationService: NotificationService = new NotificationService(socketRegistry, notificationRepository);
const tagsService: ITagsService = new TagService(tagRespository);
const chatService: ChatService = new ChatService(socketRegistry, messageRepository, notificationService, userRepository, likeRepository);
const photosService: IPhotoService = new PhotoService(photoRespository);
const emailVerificationService: EmailVerificationService = new EmailVerificationService(nodeMailerEmailSender, userRepository);
const suggestionService: SuggestionService = new SuggestionService(userRepository, suggestionRepository, tagRespository);

// Use Cases
const userUseCases: UserUseCases = new UserUseCases(userRepository, passwordHasher, likeRepository, notificationService, tagsService, photosService, emailVerificationService, socketRegistry, profileVisitRepository, blockRepository, reportRepository, commonPasswordRepository);
const notificationUserCases: NotificationUseCases = new NotificationUseCases(notificationRepository);
const chatUseCases: ChatUseCases = new ChatUseCases(messageRepository, likeRepository, userRepository, blockRepository, socketRegistry);
const searchUseCases: SearchUseCases = new SearchUseCases(searchRepository, userRepository, suggestionService);

// Routers
const authRouter: AuthRouter = new AuthRouter(userUseCases);
const userRouter: UserRouter = new UserRouter(userUseCases, photosService);
const notificationsRouter: NotificaitonRouter = new NotificaitonRouter(notificationUserCases);
const chatRouter: ChatRouter = new ChatRouter(chatUseCases);
const searchRouter: SearchRouter = new SearchRouter(searchUseCases);

expressApp.use(bodyParser.json());
expressApp.use(expressSession);

socketServer.engine.use(expressSession);

// Express routes
expressApp.use("/auth", authRouter.getRouter());
expressApp.use("/user", isAuthenticated, userRouter.getRouter());
expressApp.use("/notification", isAuthenticated, notificationsRouter.getRouter());
expressApp.use("/chat", isAuthenticated, chatRouter.getRouter());
expressApp.use("/search", isAuthenticated, searchRouter.getRouter());

expressApp.use('/images', express.static('images'));

httpServer.listen(3000, () => {
    console.log(`Server running on http://localhost:${3000}`);
});
