import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  email: string;
  name: string;
}

interface UserState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User, accessToken: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setUser: (user, accessToken) => set({ user, accessToken }),
      clearUser: () => set({ user: null, accessToken: null }),
    }),
    {
      name: "chaltteok-user",
      storage:
        typeof window !== "undefined"
          ? {
              getItem: (key) => {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
              },
              setItem: (key, value) =>
                localStorage.setItem(key, JSON.stringify(value)),
              removeItem: (key) => localStorage.removeItem(key),
            }
          : undefined,
    }
  )
);
