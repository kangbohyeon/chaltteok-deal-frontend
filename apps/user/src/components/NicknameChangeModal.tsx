"use client";

import { useEffect, useId, useState } from "react";

interface Props {
  currentNickname: string;
  saving: boolean;
  error: string | null;
  success: boolean;
  onSubmit: (nickname: string) => void;
  onClose: () => void;
}

export default function NicknameChangeModal({
  currentNickname,
  saving,
  error,
  success,
  onSubmit,
  onClose,
}: Props) {
  const [nickname, setNickname] = useState("");
  const titleId = useId();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(onClose, 1200);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onSubmit(nickname.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-bold text-gray-900">
            닉네임 변경
          </h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-xl leading-none text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-500">
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
            maxLength={30}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-rose-400 focus:outline-none"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">닉네임이 변경되었습니다.</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving || !nickname.trim()}
              className="flex-1 rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
            >
              {saving ? "저장 중..." : "변경 저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
