"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@chaltteok/shared-store";
import { loginUser, getMyProfile } from "@/api/user";
import PasswordChangePopup from "@/components/PasswordChangePopup";

export default function UserLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordChangePopup, setShowPasswordChangePopup] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setNickname = useAuthStore((s) => s.setNickname);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken, refreshToken, userId, requirePasswordChange } = await loginUser({ username, password });
      setAuth(accessToken, refreshToken, "ROLE_USER", userId);
      getMyProfile().then((p) => setNickname(p.nickname)).catch(() => {});
      if (requirePasswordChange) {
        setShowPasswordChangePopup(true);
      } else {
        router.push("/");
      }
    } catch {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      {showPasswordChangePopup && (
        <PasswordChangePopup
          onClose={() => {
            setShowPasswordChangePopup(false);
            router.push("/");
          }}
        />
      )}
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 mb-3">
          한정 이벤트
        </span>
        <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
        <p className="mt-1 text-sm text-gray-500">이벤트 참여를 위해 로그인하세요.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <input
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="example@email.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="비밀번호를 입력하세요"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <p className="text-center text-sm text-gray-500">
          아직 계정이 없으신가요?{" "}
          <Link href="/register" className="font-medium text-rose-600 hover:underline">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
}
