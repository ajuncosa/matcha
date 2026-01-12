export interface UserRegisterRequestDto {
    email: string;
    name: string;
    lastname: string;
    password: string;
}

export interface UserLoginRequestDto {
    email: string;
    password: string;
}

export interface UserProfileResponseDto {
    id: number;
    name: string;
    lastname: string;
    email: string;
    emailValidatedAt: Date | null;
    createdAt: Date;
    gender: string;
    sex: string;
    biography: string;
}
