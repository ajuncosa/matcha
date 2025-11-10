import { User } from "@/core/user/User";

interface UserRepository {
    findUser(): User
}