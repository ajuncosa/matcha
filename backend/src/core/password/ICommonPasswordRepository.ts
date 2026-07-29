export interface ICommonPasswordRepository {
    // Returns true if the given password appears in the common-passwords table.
    isCommon(password: string): Promise<boolean>;
}
