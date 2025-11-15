import { type Request, type Response, type NextFunction } from "express";
import jwt, { JsonWebTokenError, type JwtPayload } from "jsonwebtoken"

interface JwtAuthPayload extends JwtPayload {
    id?: number;
}

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
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
        const decoded = jwt.verify(token, process.env.JWTSECRET!) as JwtAuthPayload;// FIXME: remove exclamation
        req.userId = decoded.id;
        next();
    }
    catch (e) {
        if (e instanceof JsonWebTokenError) {
            res.status(401).send(e.message);
        }
    }
}