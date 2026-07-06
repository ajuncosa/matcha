import { type UpdateUserRequestDto, type UserProfileResponseDto, type ProfileVisitorDto } from "@/app/user/UserDto";
import type { UserUseCases } from "@/app/user/UserUseCases";
import { BiographyTooLong, InvalidAgePreferenceError, MissingRequestFields, NoProfilePhotoError, TagTooLongError, TooManyTagsError, UserBlockedError, UserNotFound, UserUnderageError, WeakPasswordError } from "@/core/user/User";
import { type Request, type Response } from "express";
import MatchaRouter from "./MatchaRouter";
import type { IPhotoService } from "@/core/photos/IPhotoService";

export default class UserRouter extends MatchaRouter {
    private userUseCases: UserUseCases;
    private photoService: IPhotoService;

    constructor(userUseCases: UserUseCases, photoService: IPhotoService) {
        super();
        this.userUseCases = userUseCases;
        this.photoService = photoService;
        this.router.get("/profile", (req, res) => this.getProfile(req, res));
        this.router.post("/profile", (req, res) => this.updateUser(req, res));
        this.router.get("/visitors", (req, res) => this.getVisitors(req, res));
        this.router.get("/likers", (req, res) => this.getLikers(req, res));
        this.router.post('/like/:userId', (req, res) => this.like(req, res));
        this.router.post('/unlike/:userId', (req, res) => this.unLike(req, res));
        this.router.post('/block/:userId', (req, res) => this.blockUser(req, res));
        this.router.post('/unblock/:userId', (req, res) => this.unblockUser(req, res));
        this.router.post('/report/:userId', (req, res) => this.reportUser(req, res));
        this.router.post("/photos", this.photoService.uploadPhotos("profile_photo", "photos"), (req, res) => this.addUserPhotos(req, res));
        this.router.delete("/photos/:photoId", (req, res) => this.deleteUserPhoto(req, res));
        this.router.get("/:userId", (req, res) => this.getUser(req, res));
    }

    async updateUser(req: Request, res: Response) {

        const dto: UpdateUserRequestDto = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password,
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
            tags: req.body.tags
        }
        try {
            await this.userUseCases.updateUser(req.session.userId!, dto);
            res.status(200).send("Success!");
        }
        catch (e) {
            if (e instanceof UserNotFound) {
                res.status(401).send(`User with ID \"${req.session.userId}\" was not found`);
            }
            else if (e instanceof MissingRequestFields) {
                res.status(422).send(e.message);
            }
            else if (e instanceof BiographyTooLong) {
                res.status(422).send(e.message);
            }
            else if (e instanceof WeakPasswordError) {
                res.status(422).send(e.message);
            }
            else if (e instanceof UserUnderageError) {
                res.status(422).send(e.message);
            }
            else if (e instanceof InvalidAgePreferenceError) {
                res.status(422).send(e.message);
            }
            else if (e instanceof TooManyTagsError) {
                res.status(422).send(e.message);
            }
            else if (e instanceof TagTooLongError) {
                res.status(422).send(e.message);
            }
            else {
                throw e;
            }
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const responseDto: UserProfileResponseDto = await this.userUseCases.getUser(req.session.userId!);
            res.status(200).send(responseDto);
        }
        catch (e) {
            if (e instanceof UserNotFound) {
                res.status(401).send(`User with ID "${req.session.userId}" was not found`);
            }
            else {
                throw e;
            }
        }
    }

    async getVisitors(req: Request, res: Response) {
        try {
            const visitors: ProfileVisitorDto[] = await this.userUseCases.getProfileVisitors(req.session.userId!);
            res.status(200).json(visitors);
        }
        catch (e) {
            if (e instanceof UserNotFound) {
                res.status(401).send(`User with ID "${req.session.userId}" was not found`);
            }
            else {
                throw e;
            }
        }
    }

    async getLikers(req: Request, res: Response) {
        try {
            const likers = await this.userUseCases.getProfileLikers(req.session.userId!);
            res.status(200).json(likers);
        }
        catch (e) {
            throw e;
        }
    }

    async getUser(req: Request, res: Response) {
        try {
            if (!("userId" in req.params)) {
                res.status(422).send("Missing userId parameter");
                return;
            }

            const viewerId: number | undefined = Number(req.session.userId);
            const targetId: number = Number(req.params.userId);
            const responseDto: UserProfileResponseDto = await this.userUseCases.getUser(targetId, viewerId);
            res.status(200).send(responseDto);
        }
        catch (e) {
            if (e instanceof UserNotFound) {
                res.status(404).send(`User with id ${req.params.userId} was not found`);
            }
            else if (e instanceof UserBlockedError) {
                res.status(403).send(e.message);
            }
            else {
                throw e;
            }
        }
    }

    async deleteUserPhoto(req: Request, res: Response) {
        const photoId = parseInt(req.params.photoId);
        if (!photoId)
            return res.status(400).send("Invalid photoId");
        try {
            await this.userUseCases.deleteUserPhoto(req.session.userId!, photoId);
            res.status(200).send("Success!");
        }
        catch (e) {
            if (e instanceof UserNotFound)
                res.status(401).send(`User not found`);
            else
                throw e;
        }
    }

    async like(req: Request, res: Response) {
        const producerId: number | undefined = req.session.userId;
        const targetIdStr: string | undefined = req.params.userId;

        if (!producerId || !targetIdStr) {
            res.status(400).send("Missing parameters");
            return;
        }

        const targetId: number | undefined = parseInt(targetIdStr);

        if (!targetId) {
            res.status(400).send("Invalid parameter format");
        }

        try {
            await this.userUseCases.like(producerId, targetId);
            res.status(200).send();
        }
        catch(e) {
            if (e instanceof UserNotFound) {
                res.status(401).send(`User with ID \"${req.session.userId}\" was not found`);
            }
            else if (e instanceof UserBlockedError) {
                res.status(403).send(e.message);
            }
            else if (e instanceof NoProfilePhotoError) {
                res.status(403).send(e.message);
            }
            else throw e;
        }
    }

    async unLike(req: Request, res: Response) {
        const producerId: number | undefined = req.session.userId;
        const targetIdStr: string | undefined = req.params.userId;

        if (!producerId || !targetIdStr) {
            res.status(400).send("Missing parameters");
            return;
        }

        const targetId: number | undefined = parseInt(targetIdStr);

        if (!targetId) {
            res.status(400).send("Invalid parameter format");
        }

        try {
            this.userUseCases.unLike(producerId, targetId);
            res.status(200).send();
        }
        catch(e) {
            if (e instanceof UserNotFound) {
                res.status(401).send(`User with ID \"${req.session.userId}\" was not found`);
            }
        }
    }

    async blockUser(req: Request, res: Response) {
        const blockerId = req.session.userId;
        const targetId = req.params.userId ? parseInt(req.params.userId) : NaN;
        if (!blockerId || isNaN(targetId)) return res.status(400).send("Missing parameters");
        try {
            await this.userUseCases.blockUser(blockerId, targetId);
            res.status(200).send();
        }
        catch (e) {
            if (e instanceof UserNotFound) res.status(404).send("User not found");
            else throw e;
        }
    }

    async unblockUser(req: Request, res: Response) {
        const blockerId = req.session.userId;
        const targetId = req.params.userId ? parseInt(req.params.userId) : NaN;
        if (!blockerId || isNaN(targetId)) return res.status(400).send("Missing parameters");
        try {
            await this.userUseCases.unblockUser(blockerId, targetId);
            res.status(200).send();
        }
        catch (e) {
            if (e instanceof UserNotFound) res.status(404).send("User not found");
            else throw e;
        }
    }

    async reportUser(req: Request, res: Response) {
        const reporterId = req.session.userId;
        const reportedId = req.params.userId ? parseInt(req.params.userId) : NaN;
        if (!reporterId || isNaN(reportedId)) return res.status(400).send("Missing parameters");
        try {
            await this.userUseCases.reportUser(reporterId, reportedId);
            res.status(200).send();
        }
        catch (e) {
            if (e instanceof UserNotFound) res.status(404).send("User not found");
            else throw e;
        }
    }

    async addUserPhotos(req: Request, res: Response) {
        if (!req.files) {
            return res.status(400).send("No files uploaded");
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        try {
            if (files['profile_photo'] && files['profile_photo'][0]) {
                await this.userUseCases.addUserProfilePhoto(req.session.userId!, files['profile_photo'][0].path);
            }
            if (files['photos']) {
                let paths = files['photos'].map((file) => file.path);
                await this.userUseCases.addUserPhotos(req.session.userId!, paths);
            }
            res.status(200).send("Success!");
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
