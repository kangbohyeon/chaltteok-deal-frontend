"use client";

import { useState } from "react";
import { findAccount } from "@/api/user";

interface Props {
  onClose: () => void;
}

export default function FindAccountModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await findAccount({ name, phone });
      setResult(res.maskedEmail);
    } catch {
      setError("입력하신 정보와 일치하는 계정이 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-lg font-bold text-gray-900">계정 찾기</h2>

        {result ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">입력하신 정보와 일치하는 계정을 찾았습니다.</p>
            <div className="rounded-lg bg-rose-50 px-4 py-3 text-center">
              <p className="text-base font-semibold text-rose-600">{result}</p>
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
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">전화번호</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="01012345678"
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
                disabled={loading || !name || !phone}
                className="flex-1 rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
              >
                {loading ? "조회 중..." : "찾기"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
