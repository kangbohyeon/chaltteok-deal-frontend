"use client";

import { useState } from "react";
import { resetPassword } from "@/api/user";

interface Props {
  onClose: () => void;
}

export default function ResetPasswordModal({ onClose }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPassword({ email, name });
      setSent(true);
    } catch {
      setError("입력하신 정보와 일치하는 계정이 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-lg font-bold text-gray-900">비밀번호 찾기</h2>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-rose-50 px-4 py-4 text-center">
              <p className="text-sm font-semibold text-rose-600">
                이메일로 임시 비밀번호를 발송했습니다.
              </p>
              <p className="mt-1 text-xs text-gray-500">{email} 을 확인해 주세요.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
            >
              닫기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="이름을 입력하세요"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading || !email || !name}
                className="flex-1 rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
              >
                {loading ? "발송 중..." : "임시 비밀번호 발송"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
