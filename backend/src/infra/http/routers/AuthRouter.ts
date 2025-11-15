import { type Request, type Response } from "express";
import type { UserUseCases } from "@/app/user/UserUseCases";
import MatchaRouter from "./MatchaRouter";
import type { UserLoginRequestDto, UserRegisterRequestDto } from "@/app/user/UserDto";
import { IncorrectPassword, InvalidEmailFormatError, UserEmailAlreadyExists, UserNotFound, type User } from "@/core/user/User";
import jwt from "jsonwebtoken"

export default class AuthRouter extends MatchaRouter {
    private userUseCases: UserUseCases;

    constructor(userUseCases: UserUseCases) {
        super();
        this.userUseCases = userUseCases;
        this.router.post("/register", (req, res) => this.register(req, res));
        this.router.post("/login", (req, res) => this.login(req, res));
        this.router.post("/logout", (req, res) => this.logout(req, res));
    }

    async login(req: Request, res: Response) {
        if (req.session?.isPopulated) {
            res.status(200).send("User is already logged in");
            return;
        }

        const dto: UserLoginRequestDto = {
            email: req.body.email,
            password: req.body.password
        }

        try {
            const user: User = await this.userUseCases.loginUser(dto);
            // TODO: implement token refresh
            req.session!.jwt = jwt.sign(
                { id: user.id },
                process.env.JWTSECRET!, // FIXME: remove exclamation
                {
                    algorithm: 'HS256',
                    expiresIn: '10m',
                }
            );
            res.status(200).send("User logged in");
        }
        catch (e) {
            if (e instanceof UserNotFound) {
                res.status(401).send(`User with email \"${req.body.email}\" does not exist`);
            }
            else if (e instanceof IncorrectPassword) {
                res.status(401).send(e.message);
            }
            else {
                throw e;
            }
        }
    }

    logout(req: Request, res: Response) {
        req.session = null;
        res.send("Logged out");
    }

    async register(req: Request, res: Response) {
        if (req.session?.isPopulated) {
            res.status(200).send("User is already logged in");
            return;
        }

        const dto: UserRegisterRequestDto = {
            email: req.body.email,
            name: req.body.name,
            lastname: req.body.lastname,
            password: req.body.password
        }
        try {
            await this.userUseCases.registerUser(dto);
            res.status(200).send(`Hello ${req.body.email}`); 
        }
        catch (e) {
            if (e instanceof InvalidEmailFormatError) {
                res.status(422).send(`Invalid email format \"${req.body.email}\"`);
            }
            else if (e instanceof UserEmailAlreadyExists) {
                res.status(409).send(`Email \"${req.body.email}\" is already in use`);
            }
            else {
                throw e;
            }
        }
    }

}
