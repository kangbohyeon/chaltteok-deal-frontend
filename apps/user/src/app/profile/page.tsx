"use client";

import { useState, type SyntheticEvent } from "react";
import { useMyProfile } from "@/hooks/useMyProfile";

export default function ProfilePage() {
  const { profile, loading, saving, error, success, updateNickname } = useMyProfile();
  const [nickname, setNickname] = useState("");

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-gray-400">
        불러오는 중...
      </div>
    );
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    updateNickname(nickname.trim());
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">내 정보</h1>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">이메일</label>
          <p className="text-base font-medium text-gray-900">{profile?.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">현재 닉네임</label>
          <p className="text-base font-medium text-gray-900">{profile?.nickname}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold text-gray-700">닉네임 변경</h2>
          <div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="새 닉네임을 입력하세요"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-600">닉네임이 변경되었습니다.</p>
          )}

          <button
            type="submit"
            disabled={saving || !nickname.trim()}
            className="w-full rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : "변경 저장"}
          </button>
        </form>
      </div>
    </div>
  );
}
