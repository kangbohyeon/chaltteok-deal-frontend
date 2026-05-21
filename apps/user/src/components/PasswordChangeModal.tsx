"use client";

import { useState, type SyntheticEvent } from "react";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10,}$/;

function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1 text-xs ${ok ? "text-green-600" : "text-gray-400"}`}>
      <span>{ok ? "✓" : "○"}</span>
      {label}
    </span>
  );
}

interface Props {
  saving: boolean;
  error: string | null;
  success: boolean;
  onSubmit: (currentPassword: string | undefined, newPassword: string) => void;
  onClose: () => void;
}

export default function PasswordChangeModal({ saving, error, success, onSubmit, onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const pwRules = {
    length: newPassword.length >= 10,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    digit: /\d/.test(newPassword),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
  };

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    if (!PASSWORD_REGEX.test(newPassword)) {
      setValidationError("비밀번호가 조건을 충족하지 않습니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    onSubmit(currentPassword || undefined, newPassword);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">비밀번호 변경</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="현재 비밀번호 (최초 설정 시 생략 가능)"
            autoComplete="current-password"
            autoFocus
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
              confirmPassword && confirmPassword !== newPassword ? "border-red-400" : "border-gray-300"
            }`}
          />
          {confirmPassword && confirmPassword !== newPassword && (
            <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
          )}

          {validationError && <p className="text-sm text-red-500">{validationError}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">비밀번호가 변경되었습니다.</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={
                saving ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                !PASSWORD_REGEX.test(newPassword)
              }
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
