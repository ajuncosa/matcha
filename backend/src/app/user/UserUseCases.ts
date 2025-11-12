import type { IUserRepository } from "@/core/user/IUserRepository";
import { Email, IncorrectPassword, User, UserEmailAlreadyExists, UserNotFound } from "@/core/user/User";
import type { UserRegisterRequestDto, UserLoginRequestDto } from "@/app/user/UserDto";
import type { IPasswordHasher } from "@/core/user/IPasswordHasher";

export class UserUseCases {
    private userRepo: IUserRepository;
    private passwordHasher: IPasswordHasher;

    constructor(userRepo: IUserRepository, passwordHasher: IPasswordHasher) {
        this.userRepo = userRepo;
        this.passwordHasher = passwordHasher;
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

    async loginUser(dto: UserLoginRequestDto): Promise<void> {
        const userEmail = new Email(dto.email);
        const user: User | null = await this.userRepo.findUserByEmail(userEmail);
        if (!user)
            throw new UserNotFound();

        const passwordIsValid: boolean = await this.passwordHasher.checkHash(dto.password, user.password);
        
        if (!passwordIsValid)
            throw new IncorrectPassword();

        // TODO: actually log in
        
    }

    getUserProfile(): void  {

    }
}