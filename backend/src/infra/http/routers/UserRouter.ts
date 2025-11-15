import type { UserRegisterRequestDto, UserLoginRequestDto, UserProfileResponseDto } from "@/app/user/UserDto";
import type { UserUseCases } from "@/app/user/UserUseCases";
import { IncorrectPassword, InvalidEmailFormatError, User, UserEmailAlreadyExists, UserNotFound } from "@/core/user/User";
import type JwtAuthMiddleware from "@/infra/crypto/JwtAuthMiddleware";
import { Router, type Request, type Response } from "express";

export default class UserRouter {
    private router: Router;
    private userUseCases: UserUseCases;
    private jwtAuthMiddleware: JwtAuthMiddleware;

    constructor(userUseCases: UserUseCases, jwtAuthMiddleware: JwtAuthMiddleware) {
        this.router = Router();
        this.userUseCases = userUseCases;
        this.jwtAuthMiddleware = jwtAuthMiddleware;

        this.router.post("/register", (req, res) => this.register(req, res));
        this.router.post("/login", (req, res) => this.login(req, res));
        this.router.post("/logout", (req, res) => this.logout(req, res));
        this.router.get("/profile",
            (req, res, next) => this.jwtAuthMiddleware.verifyToken(req, res, next),
            (req, res) => this.getProfile(req, res));
    }

    async login(req: Request, res: Response) {
        const dto: UserLoginRequestDto = {
            email: req.body.email,
            password: req.body.password
        }

        try {
            const user: User = await this.userUseCases.loginUser(dto);
            req.session!.jwt = this.jwtAuthMiddleware.getNewToken(user.id);
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
        try {
            if (!req.userId)
            {
                res.status(401).send(`No user ID.`);
                return;
            }
            const user: User = await this.userUseCases.getUserProfile(req.userId);
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
                res.status(401).send(`User with ID \"${req.userId}\" was not found`);
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

