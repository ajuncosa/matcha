import type { Tag } from "../tag/Tag";
import type { Photo } from "../photos/Photo";

export class InvalidEmailFormatError extends Error {
    constructor() {
        super("Invalid email format");
    }
}

export class UserNotFound extends Error {
    constructor() {
        super("User not found");
    }
}

export class IncorrectPassword extends Error {
    constructor() {
        super("Incorrect password");
    }
}

export class UserEmailAlreadyExists extends Error {
    constructor() {
        super("User email already exists");
    }
}

export class MissingRequestFields extends Error {
    constructor() {
        super("Some request fields are missing");
    }
}

export class UserAccountNotVerified extends Error {
    constructor() {
        super("User account is not verified");
    }
}

export class InvalidUserValidationToken extends Error {
    constructor() {
        super("Invalid user validation token");
    }
}

export class BiographyTooLong extends Error {
    constructor() {
        super("Biography must be 300 characters or fewer");
    }
}

export class WeakPasswordError extends Error {
    constructor() {
        super("Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, and a number");
    }
}

export class UserBlockedError extends Error {
    constructor() {
        super("This profile is not available");
    }
}

export class NoProfilePhotoError extends Error {
    constructor() {
        super("You must set a profile photo before liking someone");
    }
}

export class UsernameAlreadyExistsError extends Error {
    constructor() {
        super("This username is already taken");
    }
}

export class InvalidPasswordResetToken extends Error {
    constructor() {
        super("Invalid or expired password reset link");
    }
}

export class UserUnderageError extends Error {
    constructor() {
        super("You must be at least 18 years old to use this platform");
    }
}

export class InvalidAgePreferenceError extends Error {
    constructor() {
        super("Minimum age preference must be at least 18");
    }
}

export class TooManyTagsError extends Error {
    constructor() {
        super("You can only have up to 10 tags");
    }
}

export class TagTooLongError extends Error {
    constructor() {
        super("Tags must be 30 characters or fewer");
    }
}

export class EmailAddress {
    private email: string;

    constructor(email: string) {
        //TODO: validate if email format is correct
        this.email = email;
    }

    value(): string {
        return this.email;
    }
}

export type UserId = number;

export enum UserGender {
    Man = "man",
    Woman = "woman",
    NonBinary = "non_binary",
    Other = "other",
    Any = "any"
};

export enum UserSex {
    Male = "male",
    Female = "female",
    Intersex = "intersex",
    Any = "any"
};

export class UserDetails {
    gender: UserGender;
    sex: UserSex;
    birthday: Date;
    lat: number;
    lon: number;
    preferredGender: UserGender;
    preferredSex: UserSex;
    preferredMinAge: number;
    preferredMaxAge: number;
    biography: string;
    tags: Tag[];
    photos: Photo[];
    profilePhoto: Photo | null;
    fameRating: number;
    lastConnection: Date | null;

    constructor(gender: UserGender, sex: UserSex, birthday: Date, lat: number, lon: number,
        preferredGender: UserGender, preferredSex: UserSex, preferredMinAge: number, preferredMaxAge: number,
        biography: string, tags: Tag[], photos: Photo[], profilePhoto: Photo | null)
    {
        this.gender = gender;
        this.sex = sex;
        this.birthday = birthday;
        this.lat = lat;
        this.lon = lon;
        this.preferredGender = preferredGender;
        this.preferredSex = preferredSex;
        this.preferredMinAge = preferredMinAge;
        this.preferredMaxAge = preferredMaxAge;
        this.biography = biography;
        this.tags = tags;
        this.photos = photos;
        this.profilePhoto = profilePhoto;

        this.fameRating = 0;
        this.lastConnection = null;
    }
}

export class User {
    id: UserId;
    name: string;
    lastname: string;
    username: string;
    email: EmailAddress;
    password: string;
    createdAt: Date;
    emailValidatedAt: Date | null;
    details: UserDetails | null;

    constructor(id: UserId, name: string, lastname: string, username: string, email: EmailAddress, password: string, createdAt: Date, emailValidatedAt?: Date) {
        this.id = id;
        this.name = name;
        this.lastname = lastname;
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.emailValidatedAt = null;
        this.details = null;
        this.emailValidatedAt = emailValidatedAt || null;
    }
}

export function getUserGenderFromString(genderString: string): UserGender | null {
    switch (genderString.toLowerCase()) {
        case "man":
            return UserGender.Man;
            break;
        case "woman":
            return UserGender.Woman;
            break;
        case "non_binary":
            return UserGender.NonBinary;
            break;
        case "other":
            return UserGender.Other;
            break;
        case "any":
            return UserGender.Any;
        default:
            return null;
            break;
    }

    return null;
}

export function getUserSexFromString(sexString: string): UserSex | null {
    switch (sexString.toLowerCase()) {
        case "male":
            return UserSex.Male;
            break;
        case "female":
            return UserSex.Female;
            break;
        case "intersex":
            return UserSex.Intersex;
            break;
        case "any":
            return UserSex.Any;
        default:
            return null;
            break;
    }

    return null;
}