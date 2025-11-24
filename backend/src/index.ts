import express from "express";
import bodyParser from "body-parser";
import UserRouter from "@/infra/http/routers/UserRouter";
import { UserUseCases } from "@/app/user/UserUseCases";
import type { IUserRepository } from "@/core/user/IUserRepository";
import UserRepositoryPostgres from "@/infra/repositories/UserRepositoryPostgres";
import type { IPasswordHasher } from "./core/user/IPasswordHasher";
import { BcryptPasswordHasher } from "./infra/crypto/BcryptPasswordHasher";
import { Pool } from "pg";
import AuthRouter from "@/infra/http/routers/AuthRouter";
import { isAuthenticated } from "@/infra/http/Middlewares";
import session, { MemoryStore } from "express-session";

const pgPool: Pool = new Pool(); 

const passwordHasher: IPasswordHasher = new BcryptPasswordHasher();
const userRepository: IUserRepository = new UserRepositoryPostgres(pgPool);
const userUseCases: UserUseCases = new UserUseCases(userRepository, passwordHasher);
const authRouter: AuthRouter = new AuthRouter(userUseCases);
const userRouter: UserRouter = new UserRouter(userUseCases);

const app = express()
app.use(bodyParser.json());

app.use(session({
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
}));

app.use("/auth", authRouter.getRouter());
app.use("/user", isAuthenticated, userRouter.getRouter());

app.listen(3000, () => {
    console.log("Running")
});
