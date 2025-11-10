class InvalidEmailFormatError extends Error {
    constructor() {
        super("Invalid email format");
    }
}

class Email {
    private email: string;

    constructor(email: string) {
        //TODO: validate if email format is correct
        this.email = email;
    }
}

class UserNotFound extends Error {
    constructor() {
        super("User not found");
    }
}

class UserEmailAlreadyExists extends Error {
    constructor() {
        super("User email already exists");
    }
}

export type UserId = number;

export class User {
    id: UserId;
    name: string;
    lastname: string;
    email: Email;
    emailValidatedAt: Date;
    password: string;
    createdAt: Date;

    constructor(id: UserId) {

    }

    User() = delete;

}