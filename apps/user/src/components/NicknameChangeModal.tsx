"use client";

import { useState, type SyntheticEvent } from "react";

interface Props {
  currentNickname: string;
  saving: boolean;
  error: string | null;
  success: boolean;
  onSubmit: (nickname: string) => void;
  onClose: () => void;
}

export default function NicknameChangeModal({ currentNickname, saving, error, success, onSubmit, onClose }: Props) {
  const [nickname, setNickname] = useState("");

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onSubmit(nickname.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">닉네임 변경</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          현재 닉네임: <span className="font-medium text-gray-800">{currentNickname}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="새 닉네임을 입력하세요"
            required
            autoFocus
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">닉네임이 변경되었습니다.</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving || !nickname.trim()}
              className="flex-1 rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
            >
              {saving ? "저장 중..." : "변경 저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
