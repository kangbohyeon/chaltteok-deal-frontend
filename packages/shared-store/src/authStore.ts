import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Role = "ROLE_OWNER" | "ROLE_USER";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: Role | null;
  userUuid: string | null;
  nickname: string | null;
  setAuth: (accessToken: string, refreshToken: string, role: string, userUuid: string) => void;
  setAccessToken: (accessToken: string, refreshToken: string) => void;
  setNickname: (nickname: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      role: null,
      userUuid: null,
      nickname: null,
      setAuth: (accessToken, refreshToken, role, userUuid) => {
        set({ accessToken, refreshToken, role: role as Role, userUuid });
        if (typeof document !== "undefined") {
          document.cookie = `chaltteok-role=${role}; path=/; SameSite=Strict`;
        }
      },
      setAccessToken: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setNickname: (nickname) => set({ nickname }),
      clearAuth: () => {
        set({ accessToken: null, refreshToken: null, role: null, userUuid: null, nickname: null });
        if (typeof document !== "undefined") {
          document.cookie = "chaltteok-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      },
    }),
    {
      name: "chaltteok-auth",
      storage: typeof window !== "undefined" ? createJSONStorage(() => sessionStorage) : undefined,
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        role: state.role,
        userUuid: state.userUuid,
        nickname: state.nickname,
      }),
    }
  )
);
