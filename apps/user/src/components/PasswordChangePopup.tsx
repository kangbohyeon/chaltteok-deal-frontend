"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/api/user";

interface Props {
  onClose: () => void;
}

export default function PasswordChangePopup({ onClose }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (newPassword.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await changePassword({ newPassword });
      onClose();
      router.push("/");
    } catch {
      setError("비밀번호 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm mx-4 rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="bg-amber-500 px-6 py-4">
          <h2 className="text-lg font-bold text-white">비밀번호 변경 안내</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-700 mb-4">
            마지막 비밀번호 변경일로부터 90일이 지났습니다.<br/>
            보안을 위해 비밀번호를 변경해 주세요.
          </p>
          <form onSubmit={handleChange} className="space-y-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 (8자 이상)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="새 비밀번호 확인"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading || !newPassword || !confirm}
              className="w-full rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        </div>
        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            다음에 변경하기
          </button>
        </div>
      </div>
    </div>
  );
}
