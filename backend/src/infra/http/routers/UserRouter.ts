import type { UpdateUserDetailsRequestDto, UserProfileResponseDto } from "@/app/user/UserDto";
import type { UserUseCases } from "@/app/user/UserUseCases";
import { MissingRequestFields, User, UserNotFound } from "@/core/user/User";
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
        this.router.post("/details", (req, res) => this.updateUserDetails(req, res));
        this.router.get("/profile", (req, res) => this.getProfile(req, res));
        this.router.post('/like/:userId', (req, res) => this.like(req, res));
        this.router.post("/photos", this.photoService.uploadPhotos("profile_photo", "photos"), (req, res) => this.addUserPhotos(req, res));
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
            tags: req.body.tags
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
            if (!user.details || !user.details.profilePhoto)
            {
                //FIXME: should this be a redirect? this should return the user profile,
                // if user details are null, the redirect has to be done in the frontend.
                // There is no way you can redirect from here. Website is renderend in the frontend
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
                profilePhoto: user.details.profilePhoto,
                photos: user.details.photos,
                tags: user.details.tags,
                birthday: user.details.birthday,
                lat: user.details.lat,
                lon: user.details.lon,
                preferredGender: user.details.preferredGender,
                preferredSex: user.details.preferredSex,
                preferredMinAge: user.details.preferredMinAge,
                preferredMaxAge: user.details.preferredMaxAge,
                fameRating: user.details.fameRating,
                lastConnection: user.details.lastConnection
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
            this.userUseCases.like(producerId, targetId);
            res.status(200).send();
        }
        catch(e) {
            if (e instanceof UserNotFound) {
                res.status(401).send(`User with ID \"${req.session.userId}\" was not found`);
            }
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
