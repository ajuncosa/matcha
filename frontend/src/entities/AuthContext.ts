import { User } from "@/entities/User";

import { createContext, type Dispatch, type SetStateAction } from 'react';

export interface AuthContextPayload {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>> | null
}

export const AuthContext = createContext<AuthContextPayload>({
    user: null,
    setUser: null
});
