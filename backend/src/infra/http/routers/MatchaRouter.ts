import { Router } from "express";

export default class MatchaRouter {
    protected router: Router;

    constructor() {
        this.router = Router();
    }

    getRouter(): Router {
        return this.router;
    }
}
