import type { UserRegisterRequestDto, UserLoginRequestDto } from "@/app/user/UserDto";
import type { UserUseCases } from "@/app/user/UserUseCases";
import { IncorrectPassword, InvalidEmailFormatError, UserEmailAlreadyExists, UserNotFound } from "@/core/user/User";
import { Router, type Request, type Response } from "express";

export default class UserRouter {
    private router: Router;
    private userUseCases: UserUseCases;

    constructor(userUseCases: UserUseCases) {
        this.router = Router();
        this.userUseCases = userUseCases;
        this.router.post("/login", (req, res) => this.login(req, res));
        this.router.post("/register", (req, res) => this.register(req, res));
    }

    async login(req: Request, res: Response) {
        const dto: UserLoginRequestDto = {
            email: req.body.email,
            password: req.body.password
        }

        try {
            await this.userUseCases.loginUser(dto);
            res.status(200).send("User logged in");
        }
        catch (e) {
            if (e instanceof UserNotFound) {
                res.status(401).send(`User does not exist with email \"${req.body.email}\"`);
            }
            else if (e instanceof IncorrectPassword) {
                res.status(401).send(e.message);
            }
            else {
                throw e;
            }
        }
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

    getRouter(): Router {
        return this.router;
    }
}

