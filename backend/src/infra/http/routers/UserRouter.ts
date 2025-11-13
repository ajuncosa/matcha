import type { UserRegisterRequestDto, UserLoginRequestDto, UserProfileRequestDto, UserProfileResponseDto, UserLoginResponseDto } from "@/app/user/UserDto";
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
        // TODO: implement authenticator and insert instead of first handler
        this.router.get("/profile", (req, res, next) => {console.log("requires auth"); return next()}, (req, res) => this.getProfile(req, res));
    }

    async login(req: Request, res: Response) {
        const dto: UserLoginRequestDto = {
            email: req.body.email,
            password: req.body.password
        }

        try {
            await this.userUseCases.loginUser(dto);
            const responseDto: UserLoginResponseDto = {
                jwt: "abcd" // TODO: implement jwt
            }
            res.status(200).send(responseDto);
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

    async getProfile(req: Request, res: Response) {
        const dto: UserProfileRequestDto = {
            id: req.body.id
        }
        try {
            const user = await this.userUseCases.getUserProfile(dto);
            const responseDto: UserProfileResponseDto = {
                id: user.id,
                name: user.name,
                lastname: user.lastname,
                email: user.email.value(),
                emailValidatedAt: user.emailValidatedAt,
                createdAt: user.createdAt
            }
            res.status(200).send(responseDto);
        }
        catch (e) {
            if (e instanceof UserNotFound) {
                res.status(401).send(`User with ID \"${req.body.id}\" was not found`);
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

