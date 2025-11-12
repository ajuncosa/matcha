export interface IPasswordHasher {
    hash(password: string): Promise<string>;
    checkHash(password: string, hash: string): Promise<boolean>;
}