import type { EmailMessage } from "@/core/email/Email";
import type { EmailSenderConfiguration, IEmailSender } from "@/core/email/IEmailSender";
import nodemailer, { type Transporter } from 'nodemailer';

export default class NodeMailerEmailSender implements IEmailSender {
    
    private config: EmailSenderConfiguration;
    private transporter: Transporter;

    constructor(configuration: EmailSenderConfiguration) {
        this.config = configuration;
        
        this.transporter = nodemailer.createTransport({
            host: this.config.host,
            port: this.config.port,
            secure: this.config.secure,
        });
    }

    async sendEmail(email: EmailMessage): Promise<void> {
        await this.transporter.sendMail({
            from: `${email.senderName} ${email.senderAddress.value()}`,
            to: email.recipientAddress.value(),
            subject: email.subject,
            text: email.body,
        });
    }
}