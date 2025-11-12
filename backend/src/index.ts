import express from "express";
import bodyParser from "body-parser";
import UserRouter from "@/infra/http/routers/UserRouter";
import { UserUseCases } from "@/app/user/UserUseCases";
import type { IUserRepository } from "@/core/user/IUserRepository";
import UserRepositoryPostgres from "@/infra/repositories/UserRepositoryPostgres";
import type { IPasswordHasher } from "./core/user/IPasswordHasher";
import { BcryptPasswordHasher } from "./infra/crypto/BcryptPasswordHasher";
import { Pool } from "pg";

const pgPool: Pool = new Pool(); 

const passwordHasher: IPasswordHasher = new BcryptPasswordHasher();
const userRepository: IUserRepository = new UserRepositoryPostgres(pgPool);
const userUseCases: UserUseCases = new UserUseCases(userRepository, passwordHasher);
const userRouter: UserRouter = new UserRouter(userUseCases);

const app = express()
app.use(bodyParser.json());

app.use("/user", userRouter.getRouter());

app.listen(3000, () => {
    console.log("Running")
})

