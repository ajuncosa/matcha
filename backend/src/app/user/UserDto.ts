import type { TagId } from "@/core/tag/Tag";

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

export interface PhotoDto {
    id: number;
    filePath: string;
}

export interface TagDto {
    id: number;
    name: string;
}

export enum LikeStatus {
    NOT_LIKED = "NOT_LIKED",
    LIKED = "LIKED",
    LIKED_BACK = "LIKED_BACK",
    MUTUAL = "MUTUAL"
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
    profilePhoto: PhotoDto | null;
    photos: PhotoDto[];
    tags: TagDto[];
    birthday: Date;
    lat: number;
    lon: number;
    preferredGender: string;
    preferredSex: string;
    preferredMinAge: number;
    preferredMaxAge: number;
    fameRating: number;
    lastConnection: Date | null;
    likeStatus: LikeStatus;
    isOnline: boolean;
}

type TagAction =
  | {
      action: "add";
      value: string;
    }
  | {
      action: "delete";
      id: TagId;
      value: string;
    };

export interface ProfileVisitorDto {
    id: number;
    name: string;
    lastname: string;
    profilePhotoPath: string | null;
    lastVisitedAt: Date;
}

export interface UpdateUserRequestDto {
    firstname: string | undefined;
    lastname: string | undefined;
    email: string | undefined;
    password: string | undefined;
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
    tags: TagAction[];
}
