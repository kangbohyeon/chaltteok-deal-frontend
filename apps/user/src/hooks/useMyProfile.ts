"use client";

import { useEffect, useState } from "react";
import {
  getMyProfile,
  updateMyProfile,
  changePassword as changePasswordApi,
  type UserProfileResponse,
  type ChangePasswordRequest,
} from "@/api/user";

export function useMyProfile() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch(() => setError("프로필 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const updateNickname = async (nickname: string) => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const updated = await updateMyProfile({ nickname });
      setProfile(updated);
      setSuccess(true);
    } catch {
      setError("닉네임 변경에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (req: ChangePasswordRequest) => {
    setPasswordSaving(true);
    setPasswordSuccess(false);
    setPasswordError(null);
    try {
      await changePasswordApi(req);
      setPasswordSuccess(true);
    } catch {
      setPasswordError("비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해 주세요.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return {
    profile, loading, saving, error, success, updateNickname,
    passwordSaving, passwordError, passwordSuccess, changePassword,
  };
}
