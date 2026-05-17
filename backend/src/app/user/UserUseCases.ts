import type { IUserRepository } from "@/core/user/IUserRepository";
import { EmailAddress, getUserGenderFromString, getUserSexFromString, IncorrectPassword, InvalidUserValidationToken, MissingRequestFields, User, UserAccountNotVerified, UserEmailAlreadyExists, UserGender, UserNotFound, UserSex, type UserId } from "@/core/user/User";
import { type UserRegisterRequestDto, type UserLoginRequestDto, type UpdateUserRequestDto, type UserProfileResponseDto, LikeStatus } from "@/app/user/UserDto";
import type { IPasswordHasher } from "@/core/user/IPasswordHasher";
import type { INotificationService } from "@/core/notification/INotificationService";
import { Tag } from "@/core/tag/Tag";
import type { ITagsService } from "@/core/tag/ITagsService";
import type { IPhotoService } from "@/core/photos/IPhotoService";
import type EmailVerificationService from "../email/EmailVerificationService";
import type { ILikeRepository } from "@/core/like/ILikeRepository";
import type { LikePair } from "@/core/like/Like";
import type { IUserSocketRegistry } from "@/core/socket/IUserSocketRegistry";

export class UserUseCases {
    private userRepo: IUserRepository;
    private passwordHasher: IPasswordHasher;
    private likeRepository: ILikeRepository;
    private notificationService: INotificationService;
    private tagService: ITagsService;
    private photoService: IPhotoService;
    private emailVerificationService: EmailVerificationService;
    private socketRegistry: IUserSocketRegistry;

    constructor(
        userRepo: IUserRepository, 
        passwordHasher: IPasswordHasher,
        likeRepository: ILikeRepository,
        notificationService: INotificationService, 
        tagService: ITagsService, 
        photoService: IPhotoService,
        emailVerificationService: EmailVerificationService,
        socketRegistry: IUserSocketRegistry
    ) 
    {
        this.userRepo = userRepo;
        this.passwordHasher = passwordHasher;
        this.likeRepository = likeRepository;
        this.notificationService = notificationService;
        this.tagService = tagService;
        this.photoService = photoService;
        this.emailVerificationService = emailVerificationService,
        this.socketRegistry = socketRegistry
    }

    async registerUser(dto: UserRegisterRequestDto): Promise<void> {
        const userEmail = new EmailAddress(dto.email);
        const userExists: User | null = await this.userRepo.findUserByEmail(userEmail);
        if (userExists)
            throw new UserEmailAlreadyExists();

        //TODO: check if password format and length is valid

        const hashedPassword: string = await this.passwordHasher.hash(dto.password);
        const createdUser: User = await this.userRepo.createUser(dto.name, dto.lastname, userEmail, hashedPassword);

        this.emailVerificationService.sendVerificationEmail(createdUser);
    }

    async loginUser(dto: UserLoginRequestDto): Promise<User> {
        const userEmail = new EmailAddress(dto.email);
        const user: User | null = await this.userRepo.findUserByEmail(userEmail);
        if (!user)
            throw new UserNotFound();

        const passwordIsValid: boolean = await this.passwordHasher.checkHash(dto.password, user.password);
        
        if (!passwordIsValid)
            throw new IncorrectPassword();

        if (!user.emailValidatedAt)
            throw new UserAccountNotVerified();

        return user;        
    }

    async getUser(userId: number, viewerId?: number): Promise<UserProfileResponseDto> {
        const user: User | null = await this.userRepo.findUserById(userId);
        if (!user)
            throw new UserNotFound();

        if (!user.details)
            throw new UserNotFound();

        let likeStatus: LikeStatus = LikeStatus.NOT_LIKED;
        if (viewerId !== undefined) {
            likeStatus = await this.getLikeStatus(viewerId, userId);
        }

        const isOnline: boolean = this.socketRegistry.getUserSocket(userId) ? true : false;

        return {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            email: user.email.value(),
            emailValidatedAt: user.emailValidatedAt,
            createdAt: user.createdAt,
            gender: user.details.gender,
            sex: user.details.sex,
            biography: user.details.biography,
            profilePhoto: user.details.profilePhoto ?? null,
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
            lastConnection: user.details.lastConnection,
            likeStatus: likeStatus,
            isOnline: isOnline,
        };
    }

    async updateUser(userId: number, dto: UpdateUserRequestDto): Promise<void>
    {
        const user: User | null = await this.userRepo.findUserById(userId);
        if (!user)
            throw new UserNotFound();

        if (dto.firstname || dto.lastname || dto.email || dto.password) {
            const newName = dto.firstname ?? user.name;
            const newLastname = dto.lastname ?? user.lastname;
            const newEmail = dto.email ? new EmailAddress(dto.email) : user.email;
            let newPassword = user.password;

            if (dto.email && dto.email !== user.email.value()) {
                const emailExists: User | null = await this.userRepo.findUserByEmail(newEmail);
                if (emailExists)
                    throw new UserEmailAlreadyExists();
            }
            if (dto.password) {
                newPassword = await this.passwordHasher.hash(dto.password);
            }
            await this.userRepo.updateUser(userId, newName, newLastname, newEmail, newPassword);
        }

        const userGender: UserGender | null | undefined = dto.gender ? getUserGenderFromString(dto.gender) : undefined;
        const userSex: UserSex | null | undefined = dto.sex ? getUserSexFromString(dto.sex) : undefined;
        const userPreferredGender: UserGender | null | undefined = dto.preferredGender ? getUserGenderFromString(dto.preferredGender) : undefined;
        const userPreferredSex: UserSex | null | undefined = dto.preferredSex ? getUserSexFromString(dto.preferredSex) : undefined;

        if (userGender == null)
            throw new Error(`Cannot convert ${dto.gender} to UserGender`);
        if (userSex == null)
            throw new Error(`Cannot convert ${dto.sex} to UserSex`);
        if (userPreferredGender == null)
            throw new Error(`Cannot convert ${dto.preferredGender} to UserGender`);
        if (userPreferredSex == null)
            throw new Error(`Cannot convert ${dto.preferredSex} to UserSex`);
        if (userGender == UserGender.Any)
            throw new Error(`User cannot have \"${userGender}\" gender`);
        if (userSex == UserSex.Any)
            throw new Error(`User cannot have \"${userSex}\" sex`);

        if (!user.details)
        {
            if (!userGender || !userSex || !dto.birthday || dto.lat == undefined || dto.lon == undefined || !userPreferredGender
                || !userPreferredSex || !dto.preferredMinAge || !dto.preferredMaxAge || !dto.biography)
            {
                throw new MissingRequestFields;
            }

            const tagsToCreate: string[] = dto.tags.filter(tag => tag.action == "add").map(tag => tag.value);
            const normalizedTagsNames: string[] = this.tagService.normalizeTagsNames(tagsToCreate);
            const createdTags: Tag[] = await this.tagService.upsertTags(normalizedTagsNames);

            await this.userRepo.createUserDetails(userId, userGender, userSex,
                dto.birthday, dto.lat, dto.lon, userPreferredGender, userPreferredSex,
                dto.preferredMinAge, dto.preferredMaxAge, dto.biography);

            await this.userRepo.addTagsToUser(userId, createdTags);
        }
        else
        {
            Object.assign(user.details, {
                gender: dto.gender ?? user.details.gender,
                sex: dto.sex ?? user.details.sex,
                birthday: dto.birthday ?? user.details.birthday,
                lat: dto.lat ?? user.details.lat,
                lon: dto.lon ?? user.details.lon,
                preferredGender: dto.preferredGender ?? user.details.preferredGender,
                preferredSex: dto.preferredSex ?? user.details.preferredSex,
                preferredMinAge: dto.preferredMinAge ?? user.details.preferredMinAge,
                preferredMaxAge: dto.preferredMaxAge ?? user.details.preferredMaxAge,
                biography: dto.biography ?? user.details.biography,
            });
            await this.userRepo.updateUserDetails(userId, user.details);

            const tagsToCreate: string[] = dto.tags.filter(tag => tag.action == "add").map(tag => tag.value);
            const normalizedTagsNames: string[] = this.tagService.normalizeTagsNames(tagsToCreate);
            const createdTags: Tag[] = await this.tagService.upsertTags(normalizedTagsNames);

            //FIXME: Missing check for case when user already has the tag
            await this.userRepo.addTagsToUser(userId, createdTags);

            const tagsToRemoveFromUser: Tag[] = dto.tags.filter(tag => tag.action == "delete").map(t => new Tag(t.id, t.value));
            await this.userRepo.deleteTagsFromUser(userId, tagsToRemoveFromUser);
        }
    }

    async addUserProfilePhoto(userId: number, filePath: string): Promise<void> {
        const user: User | null = await this.userRepo.findUserById(userId);
        if (!user)
            throw new UserNotFound();
        if (!user.details)
            throw new Error(`User details have not yet been set. Cannot set profile photo.`);

        const insertedPhoto = await this.photoService.insertPhoto(filePath);
        await this.userRepo.addPhotosToUser(userId, [insertedPhoto]);
        await this.userRepo.updateUserProfilePhoto(userId, insertedPhoto);
    }

    async addUserPhotos(userId: number, filePaths: string[]): Promise<void> {
        const user: User | null = await this.userRepo.findUserById(userId);
        if (!user)
            throw new UserNotFound();

        const insertedPhotos = await this.photoService.insertPhotos(filePaths);
        await this.userRepo.addPhotosToUser(userId, insertedPhotos);
    }

    async deleteUserPhoto(userId: number, photoId: number): Promise<void> {
        const user: User | null = await this.userRepo.findUserById(userId);
        if (!user)
            throw new UserNotFound();
        const photo = user.details?.photos.find(p => p.id === photoId);
        if (!photo)
            return;
        await this.userRepo.deletePhotosFromUser(userId, [photo]);
    }

    async like(producerId: UserId, targetId: UserId): Promise<void> {
        const producer: User | null = await this.userRepo.findUserById(producerId);
        const target: User | null = await this.userRepo.findUserById(targetId);

        if (!producer || !target) throw new UserNotFound();
        
        const like: LikePair | null = await this.likeRepository.find(producerId, targetId);
        if (like[0] != null)
            return;

        this.likeRepository.create(producerId, targetId);
        this.notificationService.notifyUserLike(producer, target);
    }

    async unLike(producerId: UserId, targetId: UserId): Promise<void> {
        const producer: User | null = await this.userRepo.findUserById(producerId);
        const target: User | null = await this.userRepo.findUserById(targetId);

        if (!producer || !target) throw new UserNotFound();
        
        await this.likeRepository.delete(producerId, targetId);
        //TODO: Notify user that he has been unliked
        //this.notificationService.notifyUserLike(producer, target);
    }

    async getLikeStatus(userId: UserId, targetId: UserId): Promise<LikeStatus> {
        const producer: User | null = await this.userRepo.findUserById(userId);
        const target: User | null = await this.userRepo.findUserById(targetId);

        if (!producer || !target) throw new UserNotFound();

        const like: LikePair = await this.likeRepository.find(userId, targetId);

        if (like[0] == null && like[1] == null) {
            return LikeStatus.NOT_LIKED;
        }
        else if (like[0] == null && like[1] != null) {
            return LikeStatus.LIKED_BACK;
        }
        else if (like[0] != null && like[1] == null) {
            return LikeStatus.LIKED;
        }
        else {
            return LikeStatus.MUTUAL;
        }
    }

    async verifyUserEmail(verifyToken: string): Promise<void> {
        const user: User | null = await this.userRepo.getUserByEmailValidationToken(verifyToken);

        if (!user)
            throw new InvalidUserValidationToken();

        if (user.emailValidatedAt != null)
            throw new InvalidUserValidationToken();

        this.userRepo.setEmailValidated(user.id);
    }
}