import express from "express";
import bodyParser from "body-parser";
import UserRouter from "@/infra/http/routers/UserRouter";
import { UserUseCases } from "./app/user/UserUseCases";
import type { IUserRepository } from "./core/user/IUserRepository";
import UserRepositoryPostgres from "./infra/repositories/UserRepositoryPostgres";

const userRepository: IUserRepository = new UserRepositoryPostgres();
const userUseCases: UserUseCases = new UserUseCases(userRepository);
const userRouter: UserRouter = new UserRouter(userUseCases);

const app = express()
app.use(bodyParser.json());

app.use("/user", userRouter.getRouter());

app.listen(3000, () => {
    console.log("Running")
})

