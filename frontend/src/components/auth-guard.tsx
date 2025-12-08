import { redirect } from "react-router";

export function authGuard() {
    if (localStorage.getItem("loggedIn") != "true")
    {
        throw redirect("/login");
    }
}

export function noAuthGuard() {
    if (localStorage.getItem("loggedIn") == "true")
    {
        throw redirect("/home");
    }
}
