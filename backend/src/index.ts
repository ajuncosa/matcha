import express from "express";

export class User {
    private id: UserId;
    private name: string;
    private lastname: string;
    private email: Email;
    private emailValidatedAt: Date;
    private password: string;
    private createdAt: Date;

    constructor(id: UserId) {
        this.id = id;
    }
}

const u: User = new User();
console.log(u);

const app = express()
app.get('/', (req, res) => {
    res.send('Hello!!!!!!!')
})

app.listen(3000, () => {
    console.log("Running")
})

