import { createContext, useEffect, useState, type ReactElement } from "react";
import { useLocation, useNavigate } from "react-router";
import { API_URL } from "@/lib/config";

export interface User {
    id: number;
    name: string;
    lastname: string;
    email: string;
    /** Filename of the current profile photo, or null if none is set. */
    profilePhotoPath: string | null;
    loggedIn: boolean;
    profileCompleted: boolean;
}

/**
 * Shape of GET /auth/check-session. Every field except profileCompleted is
 * omitted while onboarding is still pending, so treat them as optional.
 */
interface SessionResponse {
    userId?: number;
    name?: string;
    lastname?: string;
    email?: string;
    profilePhotoPath?: string | null;
    profileCompleted: boolean;
}

interface AuthContextType {
    user: User;
    setUser: CallableFunction;
    deleteUser: CallableFunction;
    /** Re-reads the session from the server so UI bound to the user updates. */
    refreshUser: () => Promise<void>;
}

const defaultUserValue: AuthContextType = {
    user: {
        id: 0,
        name: "",
        lastname: "",
        email: "",
        profilePhotoPath: null,
        loggedIn: false,
        profileCompleted: false
    },
    setUser: () => { },
    deleteUser: () => { },
    refreshUser: async () => { },
};

/**
 * Folds a check-session response onto the user we already have. Fields absent
 * from the response keep their previous value; an explicit null (e.g. a removed
 * profile photo) overwrites it.
 */
function mergeSession(prev: User, session: SessionResponse): User {
    return {
        ...prev,
        id: session.userId ?? prev.id,
        name: session.name ?? prev.name,
        lastname: session.lastname ?? prev.lastname,
        email: session.email ?? prev.email,
        profilePhotoPath: session.profilePhotoPath !== undefined
            ? session.profilePhotoPath
            : prev.profilePhotoPath,
        profileCompleted: session.profileCompleted,
        loggedIn: true
    };
}

const AuthContext = createContext<AuthContextType>(defaultUserValue);

export async function logInUser(username: string, password: string): Promise<User> {
     const resp : Response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
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
                email: respJson.email ?? "",
                profilePhotoPath: respJson.profilePhotoPath ?? null,
                profileCompleted: (respJson.profileCompleted == true),
                loggedIn: true
            }
        }
}

export function AuthContextProvider({ children }: { children: ReactElement }) {
    const [user, setUserState] = useState<User>(defaultUserValue.user);
    const navigate = useNavigate();

    async function checkSession(): Promise<SessionResponse | null> {
        const request = await fetch(`${API_URL}/auth/check-session`);
        if (request.status == 200) {
            const json: SessionResponse = await request.json();
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
                const storedUser: User = JSON.parse(userJSON);
                const user: User = mergeSession(storedUser, session);
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

    /**
     * Pulls the current name/email/profile photo from the server. Call after
     * anything that mutates the profile so views bound to the auth user (the
     * sidebar footer, for one) re-render with the new values.
     */
    async function refreshUser(): Promise<void> {
        const session = await checkSession();
        if (!session) return;
        setUserState(prev => {
            const next = mergeSession(prev, session);
            localStorage.setItem("user", JSON.stringify(next));
            return next;
        });
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
        <AuthContext value={{ user, setUser, deleteUser, refreshUser }}>
            {children}
        </AuthContext>
    );
}

export default AuthContext;
