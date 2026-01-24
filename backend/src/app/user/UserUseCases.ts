import type { IUserRepository } from "@/core/user/IUserRepository";
import { Email, getUserGenderFromString, getUserSexFromString, IncorrectPassword, MissingRequestFields, User, UserEmailAlreadyExists, UserGender, UserNotFound, UserSex, type UserId } from "@/core/user/User";
import type { UserRegisterRequestDto, UserLoginRequestDto, UpdateUserDetailsRequestDto } from "@/app/user/UserDto";
import type { IPasswordHasher } from "@/core/user/IPasswordHasher";
import type { INotificationService } from "@/core/notification/INotificationService";

export class UserUseCases {
    private userRepo: IUserRepository;
    private passwordHasher: IPasswordHasher;
    private notificationService: INotificationService;

    constructor(userRepo: IUserRepository, passwordHasher: IPasswordHasher, notificationService: INotificationService) {
        this.userRepo = userRepo;
        this.passwordHasher = passwordHasher;
        this.notificationService = notificationService;
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
            if (!userGender || !userSex || !dto.birthday || /*!dto.lat || !dto.lon || */!userPreferredGender
                || !userPreferredSex || !dto.preferredMinAge || !dto.preferredMaxAge || !dto.biography)
            {
                throw new MissingRequestFields;
            }
            await this.userRepo.createUserDetails(userId, userGender, userSex,
                dto.birthday, dto.lat!, dto.lon!, userPreferredGender, userPreferredSex,
                dto.preferredMinAge, dto.preferredMaxAge, dto.biography);
        }
        else
        {
            await this.userRepo.updateUserDetails(userId, userGender, userSex,
                dto.birthday, dto.lat, dto.lon, userPreferredGender, userPreferredSex,
                dto.preferredMinAge, dto.preferredMaxAge, dto.biography, dto.fame_rating,
                dto.last_connection);
        }
    }

    async updateUserTags(): Promise<void> {
        // TODO: implement
    }

    async updateUserPhotos(): Promise<void> {
        // TODO: implement
    }

    async like(producerId: UserId, targetId: UserId): Promise<void> {
        const producer: User | null = await this.userRepo.findUserById(producerId);
        const target: User | null = await this.userRepo.findUserById(targetId);

        if (!producer || !target) throw new UserNotFound();

        this.notificationService.notifyUserLike(producer, target);
    }
}