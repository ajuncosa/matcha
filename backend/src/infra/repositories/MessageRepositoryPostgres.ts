import type { Message, MessageId } from "@/core/chat/Chat";
import type IMessageRepository from "@/core/chat/IMessageRepository";
import type { UserId } from "@/core/user/User";
import type { Pool } from "pg";

export default class MessageRepositoryPosgres implements IMessageRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

   async getUserMessages(userId: UserId): Promise<Message[]> {
        const query = await this.pool.query(`
            SELECT * FROM messages
            WHERE sender_user_id=$1 OR receiver_user_id=$1
        `, [userId]);

        const messages: Message[] = query.rows.map((m) => {
            return {
                id: Number(m.id),
                sender: Number(m.sender_user_id),
                receiver: Number(m.receiver_user_id),
                message: m.message,
                sent_at: new Date(m.sent_at),
                viewed_at: m.viewed_at ? new Date(m.viewed_at) : null
            }
        });

        return messages;
    }

    async markMessagesAsViewed(ids: MessageId[]): Promise<void> {
        await this.pool.query("\
            UPDATE messages\
            SET viewed_at=CURRENT_TIMESTAMP \
            WHERE id = ANY($1)\
            RETURNING id",
            [ids]
        );
    }

    async createMessage(sender: UserId, receiver: UserId, message: string): Promise<Message> {
        const query = await this.pool.query(`
            INSERT into messages(sender_user_id, receiver_user_id, message, sent_at)
            VALUES($1, $2, $3, CURRENT_TIMESTAMP)
            RETURNING id
        `, [sender, receiver, message]);

        return {
            id: Number(query.rows[0].id),
            sender: Number(sender),
            receiver: Number(receiver),
            message: message,
            sent_at: new Date(),
            viewed_at: null
        }
    }

}