import type { UserProfileResponseDto } from "@/app/user/UserDto";
import type { UserUseCases } from "@/app/user/UserUseCases";
import { User, UserNotFound } from "@/core/user/User";
import { type Request, type Response } from "express";
import MatchaRouter from "./MatchaRouter";

export default class UserRouter extends MatchaRouter {
    private userUseCases: UserUseCases;

    constructor(userUseCases: UserUseCases) {
        super();
        this.userUseCases = userUseCases;
        this.router.get("/profile", (req, res) => this.getProfile(req, res));
    }

    async getProfile(req: Request, res: Response) {
        try {
            const user: User = await this.userUseCases.getUser(req.session.userId!);
            const responseDto: UserProfileResponseDto = {
                id: user.id,
                name: user.name,
                lastname: user.lastname,
                email: user.email.value(),
                emailValidatedAt: user.emailValidatedAt,
                createdAt: user.createdAt,
                gender: user.details?.gender!, // FIXME: redirect to first-login form if user.details does not exist (instead of !)
                sex: user.details?.sex!, // FIXME: redirect to first-login form if user.details does not exist (instead of !)
                biography: user.details?.biography!, // FIXME: redirect to first-login form if user.details does not exist (instead of !)
            }
            res.status(200).send(responseDto);
        }
        catch (e) {
            if (e instanceof UserNotFound) {
                res.status(401).send(`User with ID \"${req.session.userId}\" was not found`);
            }
            else {
                throw e;
            }
        }
    }
}
