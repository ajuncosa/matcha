import type { IUserRepository } from "@/core/user/IUserRepository";
import { User, UserEmailAlreadyExists } from "@/core/user/User";
import type { UserRegisterRequestDto, UserLoginRequestDto } from "@/app/user/UserDto";

export class UserUseCases {
    private userRepo: IUserRepository;

    constructor(userRepo: IUserRepository) {
        this.userRepo = userRepo;
    }

    registerUser(dto: UserRegisterRequestDto): void {
        console.log("register")
        //user: User = new User();
        //this.userRepo.createUser();
    }

    loginUser(dto: UserLoginRequestDto): void {
        console.log("login user case!");
    }

    getUserProfile(): void  {

    }
}