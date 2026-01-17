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

export interface UpdateUserDetailsRequestDto {
    gender: string | undefined;
    sex: string | undefined;
    birthday: Date | undefined;
    lat: number | undefined;
    lon: number | undefined;
    preferredGender: string | undefined;
    preferredSex: string | undefined;
    preferredMinAge: number | undefined;
    preferredMaxAge: number | undefined;
    biography: string | undefined;
    fame_rating: number | undefined;
    last_connection: Date | undefined;
}
