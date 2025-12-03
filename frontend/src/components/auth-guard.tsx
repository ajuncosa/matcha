import { redirect } from "react-router";

export function AuthGuard() {
    if (localStorage.getItem("loggedIn") != "true")
    {
        throw redirect("/login");
    }
}

export function NoAuthGuard() {
    if (localStorage.getItem("loggedIn") == "true")
    {
        throw redirect("/home");
    }
}
