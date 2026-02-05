import type { IUserRepository } from "@/core/user/IUserRepository";
import { Email, getUserGenderFromString, getUserSexFromString, IncorrectPassword, MissingRequestFields, User, UserEmailAlreadyExists, UserGender, UserNotFound, UserSex, type UserId } from "@/core/user/User";
import type { UserRegisterRequestDto, UserLoginRequestDto, UpdateUserDetailsRequestDto } from "@/app/user/UserDto";
import type { IPasswordHasher } from "@/core/user/IPasswordHasher";
import type { INotificationService } from "@/core/notification/INotificationService";
import { Tag } from "@/core/tag/Tag";
import type { ITagsService } from "@/core/tag/ITagsService";
import type { IPhotoService } from "@/core/photos/IPhotoService";

export class UserUseCases {
    private userRepo: IUserRepository;
    private passwordHasher: IPasswordHasher;
    private notificationService: INotificationService;
    private tagService: ITagsService;
    private photoService: IPhotoService;

    constructor(userRepo: IUserRepository, passwordHasher: IPasswordHasher, notificationService: INotificationService, tagService: ITagsService, photoService: IPhotoService) {
        this.userRepo = userRepo;
        this.passwordHasher = passwordHasher;
        this.notificationService = notificationService;
        this.tagService = tagService;
        this.photoService = photoService;
    }

    async registerUser(dto: UserRegisterRequestDto): Promise<void> {
        const userEmail = new Email(dto.email);
        const userExists: User | null = await this.userRepo.findUserByEmail(userEmail);
        if (userExists)
            throw new UserEmailAlreadyExists();

        //TODO: check if password format and length is valid

        const hashedPassword: string = await this.passwordHasher.hash(dto.password);

        await this.userRepo.createUser(dto.name, dto.lastname, userEmail, hashedPassword);
    }

    async loginUser(dto: UserLoginRequestDto): Promise<User> {
        const userEmail = new Email(dto.email);
        const user: User | null = await this.userRepo.findUserByEmail(userEmail);
        if (!user)
            throw new UserNotFound();

        const passwordIsValid: boolean = await this.passwordHasher.checkHash(dto.password, user.password);
        
        if (!passwordIsValid)
            throw new IncorrectPassword();

        return user;        
    }

    async getUser(userId: number): Promise<User> {
        const user: User | null = await this.userRepo.findUserById(userId);
        if (!user)
            throw new UserNotFound();

        return user;
    }

    async updateUserDetails(userId: number, dto: UpdateUserDetailsRequestDto): Promise<void>
    {
        const user: User | null = await this.userRepo.findUserById(userId);
        if (!user)
            throw new UserNotFound();

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
                dto.birthday, dto.lat!, dto.lon!, userPreferredGender, userPreferredSex,
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

    async like(producerId: UserId, targetId: UserId): Promise<void> {
        const producer: User | null = await this.userRepo.findUserById(producerId);
        const target: User | null = await this.userRepo.findUserById(targetId);

        if (!producer || !target) throw new UserNotFound();

        this.notificationService.notifyUserLike(producer, target);
    }
}