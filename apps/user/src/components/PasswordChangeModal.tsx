"use client";

import { useId, useMemo, useState } from "react";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10,}$/;

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
  onSubmit: (currentPassword: string | undefined, newPassword: string) => void;
  onClose: () => void;
}

export default function PasswordChangeModal({ saving, error, onSubmit, onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const titleId = useId();

  const pwRules = useMemo(
    () => ({
      length: newPassword.length >= 10,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      digit: /\d/.test(newPassword),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
    }),
    [newPassword]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
            비밀번호 변경
          </h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-xl leading-none text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="현재 비밀번호 (최초 설정 시 생략 가능)"
            autoComplete="current-password"
            autoFocus
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-rose-400 focus:outline-none"
          />

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호"
            required
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-rose-400 focus:outline-none"
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
            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-rose-400 focus:outline-none ${
              confirmPassword && confirmPassword !== newPassword
                ? "border-red-400"
                : "border-gray-300"
            }`}
          />
          {confirmPassword && confirmPassword !== newPassword && (
            <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
          )}

          {validationError && <p className="text-sm text-red-500">{validationError}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
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
