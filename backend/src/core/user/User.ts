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

export class Email {
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

export class User {
    id: UserId;
    name: string;
    lastname: string;
    email: Email;
    emailValidatedAt: Date | null;
    password: string;
    createdAt: Date;

    constructor(id: UserId, name: string, lastname: string, email: Email, password: string, createdAt: Date) {
        this.id = id;
        this.name = name;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.emailValidatedAt = null;
    }

}