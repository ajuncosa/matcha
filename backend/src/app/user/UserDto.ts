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

export interface UserLoginResponseDto {
    jwt: string;
}

export interface UserProfileRequestDto {
    id: number;
}

export interface UserProfileResponseDto {
    id: number;
    name: string;
    lastname: string;
    email: string;
    emailValidatedAt: Date | null;
    createdAt: Date;
}
