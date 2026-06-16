"use client";

import { useState } from "react";
import { useAuthStore } from "@chaltteok/shared-store";
import { useMyProfile } from "@/hooks/useMyProfile";
import NicknameChangeModal from "@/components/NicknameChangeModal";
import PasswordChangeModal from "@/components/PasswordChangeModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function ProfilePage() {
  const setNickname = useAuthStore((s) => s.setNickname);
  const {
    profile,
    loading,
    saving,
    error,
    success,
    updateNickname,
    passwordSaving,
    passwordError,
    changePassword,
  } = useMyProfile();

  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswordSuccessModal, setShowPasswordSuccessModal] = useState(false);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-gray-400">불러오는 중...</div>
    );
  }

  const handleNicknameSubmit = async (nickname: string) => {
    const serverNickname = await updateNickname(nickname);
    if (serverNickname) setNickname(serverNickname);
  };

  const handlePasswordSubmit = async (currentPassword: string | undefined, newPassword: string) => {
    const ok = await changePassword({ currentPassword, newPassword });
    if (ok) {
      setShowPasswordModal(false);
      setShowPasswordSuccessModal(true);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">내 정보</h1>

      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-500">이메일</label>
          <p className="text-base font-medium text-gray-900">{profile?.email}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-500">닉네임</label>
            <p className="text-base font-medium text-gray-900">{profile?.nickname}</p>
          </div>
          <button
            onClick={() => setShowNicknameModal(true)}
            className="rounded-lg border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-50"
          >
            닉네임 변경
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-500">비밀번호</label>
            <p className="text-sm text-gray-400">보안을 위해 주기적으로 변경하세요.</p>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            비밀번호 변경
          </button>
        </div>
      </div>

      {showNicknameModal && profile && (
        <NicknameChangeModal
          currentNickname={profile.nickname}
          saving={saving}
          error={error}
          success={success}
          onSubmit={handleNicknameSubmit}
          onClose={() => setShowNicknameModal(false)}
        />
      )}

      {showPasswordModal && (
        <PasswordChangeModal
          saving={passwordSaving}
          error={passwordError}
          onSubmit={handlePasswordSubmit}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {showPasswordSuccessModal && (
        <ConfirmModal
          title="비밀번호 변경 완료"
          message="비밀번호 변경이 성공하였습니다."
          mode="alert"
          onConfirm={() => setShowPasswordSuccessModal(false)}
        />
      )}
    </div>
  );
}
