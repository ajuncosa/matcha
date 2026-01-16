import { redirect } from "react-router";

export function authGuard() {
    if (localStorage.getItem("user") == null)
    {
        throw redirect("/login");
    }
}

export function noAuthGuard() {
    if (localStorage.getItem("user"))
    {
        throw redirect("/browser");
    }
}
