import type { IUserRepository } from "@/core/user/IUserRepository";
import { BiographyTooLong, EmailAddress, getUserGenderFromString, getUserSexFromString, IncorrectPassword, InvalidAgePreferenceError, InvalidPasswordResetToken, InvalidUserValidationToken, MissingRequestFields, NoProfilePhotoError, TagTooLongError, TooManyTagsError, User, UserAccountNotVerified, UserBlockedError, UserEmailAlreadyExists, UsernameAlreadyExistsError, UserGender, UserNotFound, UserSex, UserUnderageError, WeakPasswordError, type UserId } from "@/core/user/User";
import { type UserRegisterRequestDto, type UserLoginRequestDto, type UpdateUserRequestDto, type UserProfileResponseDto, LikeStatus, type ProfileVisitorDto } from "@/app/user/UserDto";
import type { IProfileVisitRepository } from "@/core/profileVisit/IProfileVisitRepository";
import type { IBlockRepository } from "@/core/block/IBlockRepository";
import type { IReportRepository } from "@/core/report/IReportRepository";
import type { IPasswordHasher } from "@/core/user/IPasswordHasher";
import type { INotificationService } from "@/core/notification/INotificationService";
import { Tag } from "@/core/tag/Tag";
import type { ITagsService } from "@/core/tag/ITagsService";
import type { IPhotoService } from "@/core/photos/IPhotoService";
import type EmailVerificationService from "../email/EmailVerificationService";
import crypto from "node:crypto";
import type { ILikeRepository, LikerInfo } from "@/core/like/ILikeRepository";
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
    private profileVisitRepository: IProfileVisitRepository;
    private blockRepository: IBlockRepository;
    private reportRepository: IReportRepository;

    constructor(
        userRepo: IUserRepository,
        passwordHasher: IPasswordHasher,
        likeRepository: ILikeRepository,
        notificationService: INotificationService,
        tagService: ITagsService,
        photoService: IPhotoService,
        emailVerificationService: EmailVerificationService,
        socketRegistry: IUserSocketRegistry,
        profileVisitRepository: IProfileVisitRepository,
        blockRepository: IBlockRepository,
        reportRepository: IReportRepository
    )
    {
        this.userRepo = userRepo;
        this.passwordHasher = passwordHasher;
        this.likeRepository = likeRepository;
        this.notificationService = notificationService;
        this.tagService = tagService;
        this.photoService = photoService;
        this.emailVerificationService = emailVerificationService,
        this.socketRegistry = socketRegistry;
        this.profileVisitRepository = profileVisitRepository;
        this.blockRepository = blockRepository;
        this.reportRepository = reportRepository;
    }

    private adjustFame(userId: number, delta: number): void {
        this.userRepo.adjustFameRating(userId, delta).catch(() => {});
    }

    private readonly minimumAge = 18;
    private readonly maxTags = 10;
    private readonly maxTagLength = 30;

    private calculateAge(birthday: Date): number {
        const today = new Date();
        let age = today.getFullYear() - birthday.getFullYear();
        const monthDiff = today.getMonth() - birthday.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
            age--;
        }
        return age;
    }

    private readonly commonPasswords = [
        "password", "password1", "password123", "123456", "12345678", "qwerty",
        "qwerty123", "abc123", "letmein", "monkey", "1234567890", "iloveyou",
        "admin", "welcome", "login", "passw0rd", "master", "hello", "sunshine", "dragon"
    ];

    private validatePassword(password: string): void {
        if (
            password.length < 8 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password)
        ) {
            throw new WeakPasswordError();
        }
        if (this.commonPasswords.includes(password.toLowerCase())) {
            throw new WeakPasswordError();
        }
    }

    async registerUser(dto: UserRegisterRequestDto): Promise<void> {
        const userEmail = new EmailAddress(dto.email);
        const userExists: User | null = await this.userRepo.findUserByEmail(userEmail);
        if (userExists) throw new UserEmailAlreadyExists();

        const usernameExists: User | null = await this.userRepo.findUserByUsername(dto.username);
        if (usernameExists) throw new UsernameAlreadyExistsError();

        this.validatePassword(dto.password);

        const hashedPassword: string = await this.passwordHasher.hash(dto.password);
        const createdUser: User = await this.userRepo.createUser(dto.name, dto.lastname, userEmail, hashedPassword, dto.username);

        this.emailVerificationService.sendVerificationEmail(createdUser);
    }

    async loginUser(dto: UserLoginRequestDto): Promise<User> {
        const user: User | null = await this.userRepo.findUserByUsername(dto.username);
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
        let isBlockedByMe = false;

        if (viewerId !== undefined && viewerId !== userId) {
            // Blocked by the viewed user → deny access
            const blockedByThem = await this.blockRepository.getBlockerIds(viewerId);
            if (blockedByThem.includes(userId))
                throw new UserBlockedError();

            likeStatus = await this.getLikeStatus(viewerId, userId);
            isBlockedByMe = (await this.blockRepository.getBlockedIds(viewerId)).includes(userId);
            this.profileVisitRepository.record(viewerId, userId);
            this.adjustFame(userId, +1);
            const viewer = await this.userRepo.findUserById(viewerId);
            if (viewer) {
                this.notificationService.notifiProfileView(viewer, user).catch(() => {});
            }
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
            isBlockedByMe,
        };
    }

    async blockUser(blockerId: UserId, targetId: UserId): Promise<void> {
        const blocker = await this.userRepo.findUserById(blockerId);
        const target = await this.userRepo.findUserById(targetId);
        if (!blocker || !target) throw new UserNotFound();

        await this.blockRepository.block(blockerId, targetId);
        // Remove mutual likes so the chat disappears for both sides
        await this.likeRepository.delete(blockerId, targetId);
        await this.likeRepository.delete(targetId, blockerId);
        this.adjustFame(targetId, -5);
    }

    async unblockUser(blockerId: UserId, targetId: UserId): Promise<void> {
        const blocker = await this.userRepo.findUserById(blockerId);
        const target = await this.userRepo.findUserById(targetId);
        if (!blocker || !target) throw new UserNotFound();

        await this.blockRepository.unblock(blockerId, targetId);
    }

    async getProfileVisitors(userId: number): Promise<ProfileVisitorDto[]> {
        const visitors = await this.profileVisitRepository.getVisitors(userId);
        return visitors.map(v => ({
            id: v.id,
            name: v.name,
            lastname: v.lastname,
            profilePhotoPath: v.profilePhotoPath,
            lastVisitedAt: v.lastVisitedAt,
        }));
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
                this.validatePassword(dto.password);
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

        if (dto.biography && dto.biography.length > 300)
            throw new BiographyTooLong();

        if (dto.birthday && this.calculateAge(new Date(dto.birthday)) < this.minimumAge)
            throw new UserUnderageError();

        if (dto.preferredMinAge !== undefined && dto.preferredMinAge < this.minimumAge)
            throw new InvalidAgePreferenceError();

        const tagsToAdd = dto.tags.filter(tag => tag.action == "add");
        if (tagsToAdd.some(tag => tag.value.length > this.maxTagLength))
            throw new TagTooLongError();

        const tagsToDeleteCount = dto.tags.filter(tag => tag.action == "delete").length;
        const existingTagsCount = user.details?.tags.length ?? 0;
        if (existingTagsCount - tagsToDeleteCount + tagsToAdd.length > this.maxTags)
            throw new TooManyTagsError();

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

        if (!producer.details?.profilePhoto)
            throw new NoProfilePhotoError();

        if (await this.blockRepository.isBlocked(producerId, targetId))
            throw new UserBlockedError();

        const like: LikePair | null = await this.likeRepository.find(producerId, targetId);
        if (like[0] != null)
            return;

        await this.likeRepository.create(producerId, targetId);
        this.notificationService.notifyUserLike(producer, target);

        const wasVisitFirst = await this.profileVisitRepository.hadVisited(producerId, targetId);
        this.adjustFame(targetId, wasVisitFirst ? 5 : 3);

        // like[1] non-null means target had already liked producer → mutual match formed
        if (like[1] != null) {
            this.adjustFame(targetId, +2);
            this.adjustFame(producerId, +2);
            this.notificationService.notifyUserLikedBack(producer, target).catch(() => {});
        }
    }

    async unLike(producerId: UserId, targetId: UserId): Promise<void> {
        const producer: User | null = await this.userRepo.findUserById(producerId);
        const target: User | null = await this.userRepo.findUserById(targetId);

        if (!producer || !target) throw new UserNotFound();

        await this.likeRepository.delete(producerId, targetId);
        this.adjustFame(targetId, -2);
        this.notificationService.notifyUnlikeNotification(producer, target).catch(() => {});

        // Connection is broken: close the chat in real time for both users.
        this.socketRegistry.getUserSocket(targetId)?.send('chat:closed', { userId: producerId });
        this.socketRegistry.getUserSocket(producerId)?.send('chat:closed', { userId: targetId });
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

    async getProfileLikers(userId: number): Promise<LikerInfo[]> {
        return this.likeRepository.getLikers(userId);
    }

    async reportUser(reporterId: UserId, reportedId: UserId): Promise<void> {
        const reporter = await this.userRepo.findUserById(reporterId);
        const reported = await this.userRepo.findUserById(reportedId);
        if (!reporter || !reported) throw new UserNotFound();
        await this.reportRepository.report(reporterId, reportedId);
    }

    async forgotPassword(email: string): Promise<void> {
        const userEmail = new EmailAddress(email);
        const user = await this.userRepo.findUserByEmail(userEmail);
        if (!user) return; // don't reveal whether email exists

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await this.userRepo.setPasswordResetToken(user.id, token, expiresAt);

        const domain = process.env.DOMAIN || "http://localhost";
        const resetUrl = `${domain}/reset-password?token=${token}`;
        this.emailVerificationService.sendPasswordResetEmail(user, resetUrl);
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const user = await this.userRepo.getUserByPasswordResetToken(token);
        if (!user) throw new InvalidPasswordResetToken();

        this.validatePassword(newPassword);
        const hashed = await this.passwordHasher.hash(newPassword);
        await this.userRepo.updatePassword(user.id, hashed);
        await this.userRepo.clearPasswordResetToken(user.id);
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