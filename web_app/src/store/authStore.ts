import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    warungId?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: () => !!get().token && !!get().user,
            login: (user, token) => {
                if (typeof window !== "undefined") {
                    localStorage.setItem("token", token);
                }
                set({ user, token });
            },
            logout: () => {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("token");
                }
                set({ user: null, token: null });
            },
        }),
        {
            name: "auth-storage",
        }
    )
);
