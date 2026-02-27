import type { EmailMessage } from "@/core/email/Email";

export interface IEmailSender {
    sendEmail(email: EmailMessage): Promise<void>;
}

//TODO: missing parameters for future production, right now is just for dev
export interface EmailSenderConfiguration {
    host: string;
    port: number;
    secure: boolean;
};