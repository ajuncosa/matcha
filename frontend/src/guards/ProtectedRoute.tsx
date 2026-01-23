import AuthContext from "@/contexts/AuthContextProvider";
import { useContext } from "react";
import { Navigate, Outlet } from "react-router";

export function ProtectedRoute() {
    const { user } = useContext(AuthContext);

    return (
        user.loggedIn ? <Outlet/> : <Navigate to="/login" replace/>
    )
}