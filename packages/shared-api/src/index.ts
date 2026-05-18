import axios from "axios";
import { useAuthStore } from "@chaltteok/shared-store";

const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ── Request: JWT + role 헤더 자동 주입 ────────────────────────────
api.interceptors.request.use((config) => {
  const { accessToken, role, userId } = useAuthStore.getState();
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  if (userId) {
    if (role === "ROLE_OWNER") config.headers["X-Owner-Id"] = String(userId);
    if (role === "ROLE_USER") config.headers["X-User-Id"] = String(userId);
  }
  return config;
});

// ── Response: 401 시 토큰 재발급 후 원 요청 재시도 ───────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 로그인 엔드포인트의 401은 재발급 없이 그대로 전파 (로그인 실패 메시지 표시용)
    if (originalRequest.url?.includes("/auth/login")) {
      return Promise.reject(error);
    }

    // 인증 헤더 없이 보낸 요청(비로그인 상태)의 401은 리다이렉트 없이 조용히 거부
    if (!originalRequest.headers?.["Authorization"]) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const { refreshToken, role, clearAuth } = useAuthStore.getState();
    const loginPath = "/login";

    if (!refreshToken || !role) {
      clearAuth();
      if (typeof window !== "undefined") window.location.href = loginPath;
      return Promise.reject(error);
    }

    const reissueUrl =
      role === "ROLE_OWNER"
        ? "/api/v1/owner/auth/reissue"
        : "/api/v1/user/auth/reissue";

    try {
      const res = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
        reissueUrl,
        { refreshToken }
      );
      const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data;
      useAuthStore.getState().setAccessToken(newAccess, newRefresh);
      processQueue(null, newAccess);
      originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") window.location.href = loginPath;
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
