import type { UpdateUserDetailsRequestDto, UserProfileResponseDto } from "@/app/user/UserDto";
import type { UserUseCases } from "@/app/user/UserUseCases";
import { MissingRequestFields, User, UserNotFound } from "@/core/user/User";
import { type Request, type Response } from "express";
import MatchaRouter from "./MatchaRouter";

export default class UserRouter extends MatchaRouter {
    private userUseCases: UserUseCases;

    constructor(userUseCases: UserUseCases) {
        super();
        this.userUseCases = userUseCases;
        this.router.post("/update-user-details", (req, res) => this.updateUserDetails(req, res));
        this.router.get("/profile", (req, res) => this.getProfile(req, res));
    }

    async updateUserDetails(req: Request, res: Response) {

        const dto: UpdateUserDetailsRequestDto = {
            gender: req.body.gender,
            sex: req.body.sex,
            birthday: req.body.birthday,
            lat: req.body.lat,
            lon: req.body.lon,
            preferredGender: req.body.preferredGender,
            preferredSex: req.body.preferredSex,
            preferredMinAge: req.body.preferredMinAge,
            preferredMaxAge: req.body.preferredMaxAge,
            biography: req.body.biography,
            fame_rating: req.body.userIfame_ratingd,
            last_connection: req.body.last_connection
        }
        try {
            await this.userUseCases.updateUserDetails(req.session.userId!, dto);
            res.status(200).send("Success!");
        }
        catch (e) {
            if (e instanceof UserNotFound) {
                res.status(401).send(`User with ID \"${req.session.userId}\" was not found`);
            }
            if (e instanceof MissingRequestFields) {
                res.status(422).send(e.message);
            }
            else {
                throw e;
            }
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const user: User = await this.userUseCases.getUser(req.session.userId!);
            if (!user.details)
            {
                console.log("AAAAA")
                res.redirect("/welcome");
                return;
            }
            const responseDto: UserProfileResponseDto = {
                id: user.id,
                name: user.name,
                lastname: user.lastname,
                email: user.email.value(),
                emailValidatedAt: user.emailValidatedAt,
                createdAt: user.createdAt,
                gender: user.details.gender,
                sex: user.details.sex,
                biography: user.details.biography,
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
