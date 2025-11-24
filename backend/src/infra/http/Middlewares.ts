import { type Request, type Response, type NextFunction } from "express";

declare module "express-session" {
    interface SessionData {
        userId: number
    }
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
    if (req.session && req.session.userId) {
        next();
    }
    else {
        res.status(401).send('No session found, authorization denied'); // TODO: possibly redirect?
    }
}
