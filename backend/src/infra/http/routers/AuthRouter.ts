import { type Request, type Response } from "express";
import type { UserUseCases } from "@/app/user/UserUseCases";
import MatchaRouter from "./MatchaRouter";
import type { UserLoginRequestDto, UserRegisterRequestDto } from "@/app/user/UserDto";
import { IncorrectPassword, InvalidEmailFormatError, UserEmailAlreadyExists, UserNotFound, type User } from "@/core/user/User";

export default class AuthRouter extends MatchaRouter {
    private userUseCases: UserUseCases;

    constructor(userUseCases: UserUseCases) {
        super();
        this.userUseCases = userUseCases;
        this.router.post("/register", (req, res) => this.register(req, res));
        this.router.post("/login", (req, res) => this.login(req, res));
        this.router.post("/logout", (req, res) => this.logout(req, res));
        this.router.get('/check-session', (req, res) => this.checkSession(req, res));
    }

    async login(req: Request, res: Response) {

        const dto: UserLoginRequestDto = {
            email: req.body.email,
            password: req.body.password
        }

        try {
            const user: User = await this.userUseCases.loginUser(dto);
            req.session.userId = user.id;
            res.status(200).json({
                profileCompleted: user.details != null
            });
        }
        catch (e) {
            if (e instanceof UserNotFound) {
                res.status(401).send(`User with email \"${req.body.email}\" does not exist`);   //TODO: easier for frontend to parse if JSON
            }
            else if (e instanceof IncorrectPassword) {
                res.status(401).send(e.message);   //TODO: easier for frontend to parse if JSON
            }
            else {
                throw e;
            }
        }
    }

    logout(req: Request, res: Response) {
        req.session.destroy(function(err) {
            if (err) {
                console.log(err);
            }
            else {
                res.status(200).send("Logged out"); // TODO: redirect?   //TODO: easier for frontend to parse if JSON
            }
        });
    }

    async register(req: Request, res: Response) {
        const dto: UserRegisterRequestDto = {
            email: req.body.email,
            name: req.body.name,
            lastname: req.body.lastname,
            password: req.body.password
        }
        try {
            await this.userUseCases.registerUser(dto);
            res.status(200).send(`Hello ${req.body.email}`); //TODO: easier for frontend to parse if JSON
        }
        catch (e) {
            if (e instanceof InvalidEmailFormatError) {
                res.status(422).send(`Invalid email format \"${req.body.email}\"`);   //TODO: easier for frontend to parse if JSON
            }
            else if (e instanceof UserEmailAlreadyExists) {
                res.status(409).send(`Email \"${req.body.email}\" is already in use`);  //TODO: easier for frontend to parse if JSON
            }
            else {
                throw e;
            }
        }
    }

    async checkSession(req: Request, res: Response) {
        console.log("asd")
        if (req.session && req.session.userId) {
            const user: User = await this.userUseCases.getUser(req.session.userId);

            res.status(200).json({
                profileCompleted: user.details != null
            });
        }
        else {
            res.status(401).send();
        }
    }

}
