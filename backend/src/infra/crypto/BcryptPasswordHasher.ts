import type { IPasswordHasher } from "@/core/user/IPasswordHasher";
import bcrypt from "bcryptjs";

export class BcryptPasswordHasher implements IPasswordHasher {
    async hash(password: string): Promise<string> {
        // TODO: generate different salt per user or something
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        return hash;
    }

    async checkHash(password: string, hash: string): Promise<boolean> {
        const validHash: boolean = await bcrypt.compare(password, hash);

        return validHash;
    }
}