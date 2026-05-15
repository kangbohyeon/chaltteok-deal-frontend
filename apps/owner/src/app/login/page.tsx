"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@chaltteok/shared-store";
import { loginOwner } from "@/api/owner";
import PasswordChangePopup from "./_components/PasswordChangePopup";

export default function OwnerLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordChangePopup, setShowPasswordChangePopup] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken, refreshToken, userId, requirePasswordChange } = await loginOwner({ username, password });
      setAuth(accessToken, refreshToken, "ROLE_OWNER", userId);
      if (requirePasswordChange) {
        setShowPasswordChangePopup(true);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
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
            router.push("/dashboard");
          }}
        />
      )}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">점주 로그인</h1>
        <p className="mt-1 text-sm text-gray-500">상품 및 재고 관리 페이지입니다.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="아이디를 입력하세요"
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
      </form>
    </div>
  );
}
