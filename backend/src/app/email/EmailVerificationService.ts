import type { EmailMessage } from "@/core/email/Email";
import type { IEmailSender } from "@/core/email/IEmailSender";
import type { IUserRepository } from "@/core/user/IUserRepository";
import { EmailAddress, type User } from "@/core/user/User";
import crypto from "node:crypto";

class EmailVerificationService {
    private emailSender: IEmailSender;
    private userRepo: IUserRepository;

    constructor(emailSender: IEmailSender, userRepo: IUserRepository) {
        this.emailSender = emailSender;
        this.userRepo = userRepo;
    }

    private composeVerificationEmail(recipientAddress: EmailAddress, verificationUrl: string): EmailMessage {
        //TODO: move to env or something?
        const emailSenderName: string = "Matcha Emailer";
        const emailSenderAddress: EmailAddress = new EmailAddress('no-reply@matcha.com');

        let emailBody: string = "";

        emailBody += "Thanks for joining Matcha. Please verify your email to complete setup:";
        emailBody += `${verificationUrl}`;

        let email: EmailMessage = {
            senderName: emailSenderName,
            senderAddress: emailSenderAddress,
            recipientAddress: recipientAddress,
            subject: "Email verification",
            body: emailBody
        }

        return email;
    }

    private createVerificationToken(): string {
        return crypto.randomUUID(); //TODO: maybe this should be injected instead of used directly here
    }

    private createVerificationUrl(hash: string): string {
        const domain: string = process.env.DOMAIN || "http://localhost";
        const base = new URL(domain);
        return new URL(`/verify/${hash}`, base).toString();
    }

    async sendVerificationEmail(user: User): Promise<void> {
        const verificationToken: string = this.createVerificationToken();
        
        await this.userRepo.setEmailToken(user.id, verificationToken);

        const verificationUrl: string = this.createVerificationUrl(verificationToken);
        const emailMessage: EmailMessage = this.composeVerificationEmail(user.email, verificationUrl);
        this.emailSender.sendEmail(emailMessage);
    }
}

export default EmailVerificationService;