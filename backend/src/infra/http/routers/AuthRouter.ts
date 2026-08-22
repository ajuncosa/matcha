import { type Request, type Response } from "express";
import type { UserUseCases } from "@/app/user/UserUseCases";
import MatchaRouter from "./MatchaRouter";
import type { UserLoginRequestDto, UserRegisterRequestDto, UserProfileResponseDto } from "@/app/user/UserDto";
import { CommonPasswordError, IncorrectPassword, InvalidEmailFormatError, InvalidPasswordResetToken, InvalidUsernameFormatError, InvalidUserValidationToken, UserAccountNotVerified, UserEmailAlreadyExists, UsernameAlreadyExistsError, UserNotFound, WeakPasswordError, type User } from "@/core/user/User";

export default class AuthRouter extends MatchaRouter {
    private userUseCases: UserUseCases;

    constructor(userUseCases: UserUseCases) {
        super();
        this.userUseCases = userUseCases;
        this.router.post("/register", (req, res) => this.register(req, res));
        this.router.post("/login", (req, res) => this.login(req, res));
        this.router.post("/logout", (req, res) => this.logout(req, res));
        this.router.get('/check-session', (req, res) => this.checkSession(req, res));
        this.router.get("/verify/:token", (req, res) => this.verifyUser(req, res));
        this.router.post("/forgot-password", (req, res) => this.forgotPassword(req, res));
        this.router.post("/reset-password", (req, res) => this.resetPassword(req, res));
    }

    async login(req: Request, res: Response) {

        const dto: UserLoginRequestDto = {
            username: req.body.username,
            password: req.body.password
        }

        try {
            const user: User = await this.userUseCases.loginUser(dto);
            req.session.userId = user.id;
            res.status(200).json({
                userId: user.id,
                name: user.name,
                lastname: user.lastname,
                email: user.email.value(),
                profilePhotoPath: user.details?.profilePhoto?.filePath ?? null,
                profileCompleted: user.details != null
            });
        }
        catch (e) {
            if (e instanceof UserNotFound) {
                res.status(401).send(`User with username "${req.body.username}" does not exist`);
            }
            else if (e instanceof IncorrectPassword) {
                res.status(401).send(e.message);   //TODO: easier for frontend to parse if JSON
            }
            else if (e instanceof UserAccountNotVerified) {
                res.status(403).send(e.message);
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
            username: req.body.username,
            password: req.body.password
        }
        try {
            await this.userUseCases.registerUser(dto);
            res.status(200).send(`Hello ${req.body.email}`);
        }
        catch (e) {
            if (e instanceof InvalidEmailFormatError) {
                res.status(422).send(`Invalid email format "${req.body.email}"`);
            }
            else if (e instanceof UserEmailAlreadyExists) {
                res.status(409).send(`Email "${req.body.email}" is already in use`);
            }
            else if (e instanceof UsernameAlreadyExistsError) {
                res.status(409).send(e.message);
            }
            else if (e instanceof InvalidUsernameFormatError) {
                res.status(422).send(e.message);
            }
            else if (e instanceof WeakPasswordError) {
                res.status(422).send(e.message);
            }
            else if (e instanceof CommonPasswordError) {
                res.status(422).send(e.message);
            }
            else {
                throw e;
            }
        }
    }

    async checkSession(req: Request, res: Response) {
        if (!req.session || !req.session.userId) {
            res.status(401).send();
            return;
        }

        try {
            const userProfile: UserProfileResponseDto = await this.userUseCases.getUser(req.session.userId);

            res.status(200).json({
                userId: userProfile.id,
                name: userProfile.name,
                lastname: userProfile.lastname,
                email: userProfile.email,
                profilePhotoPath: userProfile.profilePhoto?.filePath ?? null,
                profileCompleted: userProfile.biography != null
            });
        }
        catch (e) {
            if (e instanceof UserNotFound) {
                res.status(200).json({ profileCompleted: false });
            }
            else {
                throw e;
            }
        }
    }

    async forgotPassword(req: Request, res: Response) {
        const email: string = req.body.email;
        if (!email) return res.status(400).send("Email is required");
        await this.userUseCases.forgotPassword(email);
        res.status(200).send();
    }

    async resetPassword(req: Request, res: Response) {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).send("Missing parameters");
        try {
            await this.userUseCases.resetPassword(token, password);
            res.status(200).send();
        }
        catch (e) {
            if (e instanceof InvalidPasswordResetToken) res.status(400).send(e.message);
            else if (e instanceof WeakPasswordError) res.status(422).send(e.message);
            else if (e instanceof CommonPasswordError) res.status(422).send(e.message);
            else throw e;
        }
    }

    async verifyUser(req: Request, res: Response) {
        if (!req.params.token) {
            res.status(400).json({
                message: "Invalid token"
            });
            return ;
        }

        try {
            await this.userUseCases.verifyUserEmail(req.params.token);
            res.status(200).send();
        }
        catch (e) {
            if (e instanceof InvalidUserValidationToken) {
                res.status(400).send();
            }
        }
    }
}
