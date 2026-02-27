import type { EmailAddress } from "@/core/user/User";

export interface EmailMessage {
    senderAddress: EmailAddress;
    recipientAddress: EmailAddress;
    senderName: string;
    subject: string;
    body: string;
}