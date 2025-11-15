import express from "express";
import bodyParser from "body-parser";
import UserRouter from "@/infra/http/routers/UserRouter";
import { UserUseCases } from "@/app/user/UserUseCases";
import type { IUserRepository } from "@/core/user/IUserRepository";
import UserRepositoryPostgres from "@/infra/repositories/UserRepositoryPostgres";
import type { IPasswordHasher } from "./core/user/IPasswordHasher";
import { BcryptPasswordHasher } from "./infra/crypto/BcryptPasswordHasher";
import { Pool } from "pg";
import cookieSession from "cookie-session";
import JwtAuthMiddleware from "@/infra/crypto/JwtAuthMiddleware";

const pgPool: Pool = new Pool(); 

const passwordHasher: IPasswordHasher = new BcryptPasswordHasher();
const userRepository: IUserRepository = new UserRepositoryPostgres(pgPool);
const userUseCases: UserUseCases = new UserUseCases(userRepository, passwordHasher);
const jwtAuthMiddleware: JwtAuthMiddleware = new JwtAuthMiddleware("my-secret"); // FIXME: add a real key
const userRouter: UserRouter = new UserRouter(userUseCases, jwtAuthMiddleware);

declare global {
   namespace Express {
      interface Request {
         userId?: number
      }
   }
}

const app = express()
app.use(bodyParser.json());

app.use(cookieSession({
    name: 'session',
    keys: ['my-secret-key'], // FIXME: add something secret (?)
    httpOnly: true,
    //secure: true, // cookie only sent through HTTPS
    sameSite: 'strict',
    signed: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use("/user", userRouter.getRouter());

app.listen(3000, () => {
    console.log("Running")
});

