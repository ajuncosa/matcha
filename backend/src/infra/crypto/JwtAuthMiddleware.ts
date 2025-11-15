import jwt, { JsonWebTokenError, type JwtPayload } from "jsonwebtoken";
import { type NextFunction, type Request, type Response } from "express";

interface JwtAuthPayload extends JwtPayload {
    id: number;
}

export default class JwtAuthMiddleware {
    private secret: string;

    constructor(secret: string) {
        this.secret = secret;
    }

    getNewToken(userId: number): string {
        return jwt.sign(
            { id: userId },
            this.secret,
            {
                algorithm: 'HS256',
                expiresIn: '10m',
            });
    }

    verifyToken(req: Request, res: Response, next: NextFunction): void {
        if (!req.session) {
            res.status(401).send('No session found, authorization denied');
            return;
        }

        const token = req.session.jwt;
        if (!token) {
            res.status(401).send('No token found, authorization denied');
            return;
        }

        try {
            const decoded = jwt.verify(token, this.secret) as JwtAuthPayload;
            req.userId = decoded.id;
            next();
        }
        catch (e) {
            if (e instanceof JsonWebTokenError) {
                res.status(401).send(e.message);
            }
        }
    }

}
