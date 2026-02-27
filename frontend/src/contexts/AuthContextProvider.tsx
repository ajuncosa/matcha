import { createContext, useEffect, useState, type ReactElement } from "react";
import { useLocation, useNavigate } from "react-router";

export interface User {
    id: number;
    name: string;
    lastname: string;
    loggedIn: boolean;
    profileCompleted: boolean;
}

interface AuthContextType {
    user: User;
    setUser: CallableFunction;
    deleteUser: CallableFunction;
}

const defaultUserValue: AuthContextType = {
    user: {
        id: 0,
        name: "",
        lastname: "",
        loggedIn: false,
        profileCompleted: false
    },
    setUser: () => { },
    deleteUser: () => { },
};

const AuthContext = createContext<AuthContextType>(defaultUserValue);

export async function logInUser(email: string, password: string): Promise<User> {
     const resp : Response = await fetch("http://localhost/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (resp.status == 403) {
            throw Error("Account is not verified");
        }
        else if (resp.status != 200) {
            throw Error("Invalid credentials");
        }
        else {
            const respJson = await resp.json();
            return {
                id: respJson.userId,
                name: respJson.name,
                lastname: respJson.lastname,
                profileCompleted: (respJson.profileCompleted == true),
                loggedIn: true
            }
        }
}

export function AuthContextProvider({ children }: { children: ReactElement }) {
    const [user, setUserState] = useState<User>(defaultUserValue.user);
    const navigate = useNavigate();

    async function checkSession(): Promise<{profileCompleted: boolean} | null> {
        const request = await fetch('http://localhost/api/auth/check-session');
        if (request.status == 200) {
            const json: {profileCompleted: boolean} = await request.json();
            return json;
        }
        return null;
    }

    const location = useLocation();

    async function initAuth() {
        const userJSON: string | null = localStorage.getItem("user");
        if (userJSON) {
            const session = await checkSession();
            if (session) {
                let user: User = await JSON.parse(userJSON);
                user.profileCompleted = session.profileCompleted;
                setUser(user);
                if (user.profileCompleted) {
                    navigate(location, {
                        replace: true
                    });
                }
                else {
                    navigate("/welcome", {
                        replace: true
                    });
                }
                
            }
        }
    }

    function setUser(user: User) {
        const userJson: string = JSON.stringify(user);
        localStorage.setItem("user", userJson);
        setUserState(user);
    }

    function deleteUser() {
        setUserState(defaultUserValue.user);
        localStorage.removeItem("user");
    }

    useEffect(() => {
        initAuth();
    }, []);

    return (
        <AuthContext value={{ user, setUser, deleteUser }}>
            {children}
        </AuthContext>
    );
}

export default AuthContext;
