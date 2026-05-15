"use client";

import { useState, type SyntheticEvent } from "react";
import { useMyProfile } from "@/hooks/useMyProfile";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10,}$/;

function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1 text-xs ${ok ? "text-green-600" : "text-gray-400"}`}>
      <span>{ok ? "✓" : "○"}</span>
      {label}
    </span>
  );
}

export default function ProfilePage() {
  const {
    profile, loading, saving, error, success, updateNickname,
    passwordSaving, passwordError, passwordSuccess, changePassword,
  } = useMyProfile();

  const [nickname, setNickname] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwValidationError, setPwValidationError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-gray-400">
        불러오는 중...
      </div>
    );
  }

  const handleNicknameSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    updateNickname(nickname.trim());
  };

  const handlePasswordSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwValidationError(null);

    if (!PASSWORD_REGEX.test(newPassword)) {
      setPwValidationError("비밀번호가 조건을 충족하지 않습니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwValidationError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    changePassword({
      currentPassword: currentPassword || undefined,
      newPassword,
    });
  };

  const pwRules = {
    length: newPassword.length >= 10,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    digit: /\d/.test(newPassword),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
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

        <form onSubmit={handleNicknameSubmit} className="space-y-4 border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold text-gray-700">닉네임 변경</h2>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="새 닉네임을 입력하세요"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">닉네임이 변경되었습니다.</p>}
          <button
            type="submit"
            disabled={saving || !nickname.trim()}
            className="w-full rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : "변경 저장"}
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold text-gray-700">비밀번호 변경</h2>

          <div className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호 (최초 설정 시 생략 가능)"
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호"
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />

            {newPassword && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 px-1">
                <PasswordRule ok={pwRules.length} label="10자 이상" />
                <PasswordRule ok={pwRules.upper} label="대문자 포함" />
                <PasswordRule ok={pwRules.lower} label="소문자 포함" />
                <PasswordRule ok={pwRules.digit} label="숫자 포함" />
                <PasswordRule ok={pwRules.special} label="특수문자 포함" />
              </div>
            )}

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 확인"
              required
              autoComplete="new-password"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                confirmPassword && confirmPassword !== newPassword
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          {pwValidationError && <p className="text-sm text-red-500">{pwValidationError}</p>}
          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-green-600">비밀번호가 변경되었습니다.</p>}

          <button
            type="submit"
            disabled={
              passwordSaving ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              !PASSWORD_REGEX.test(newPassword)
            }
            className="w-full rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
          >
            {passwordSaving ? "저장 중..." : "비밀번호 변경"}
          </button>
        </form>
      </div>
    </div>
  );
}
