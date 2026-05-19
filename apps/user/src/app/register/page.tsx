"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, checkEmailDuplicate } from "@/api/user";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{10,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserRegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", passwordConfirm: "", name: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "email") setEmailChecked(false);
  };

  const handleEmailCheck = async () => {
    if (!EMAIL_REGEX.test(form.email)) {
      setErrors((prev) => ({ ...prev, email: "올바른 이메일 형식을 입력해 주세요." }));
      return;
    }
    setEmailCheckLoading(true);
    try {
      const isDuplicate = await checkEmailDuplicate(form.email);
      if (isDuplicate) {
        setErrors((prev) => ({ ...prev, email: "이미 사용 중인 이메일입니다." }));
        setEmailChecked(false);
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
        setEmailChecked(true);
      }
    } catch {
      setErrors((prev) => ({ ...prev, email: "중복 확인에 실패했습니다. 다시 시도해 주세요." }));
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!emailChecked) {
      next.email = "이메일 중복 확인을 해주세요.";
    }

    if (!PASSWORD_REGEX.test(form.password)) {
      next.password = "대문자 1자 이상, 숫자 1자 이상, 특수문자 1자 이상, 10자리 이상이어야 합니다.";
    }

    if (form.password !== form.passwordConfirm) {
      next.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await registerUser({ email: form.email, password: form.password, name: form.name, phone: form.phone });
      router.push("/login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errorMessage?: string } } })?.response?.data?.errorMessage;
      setServerError(msg ?? "회원가입에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !emailChecked || !form.password || !form.passwordConfirm || !form.name || !form.phone;

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 mb-3">
          찰떡
        </span>
        <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
        <p className="mt-1 text-sm text-gray-500">찰떡 이벤트에 참여하려면 가입하세요.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
              className={`flex-1 rounded-lg border px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                emailChecked ? "border-green-400 bg-green-50" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={handleEmailCheck}
              disabled={emailCheckLoading || !form.email}
              className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:border-rose-400 hover:text-rose-500 disabled:opacity-50 transition-colors"
            >
              {emailCheckLoading ? "확인 중..." : emailChecked ? "확인 완료" : "중복확인"}
            </button>
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          {emailChecked && !errors.email && (
            <p className="mt-1 text-xs text-green-600">사용 가능한 이메일입니다.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="대문자·숫자·특수문자 포함 10자 이상"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
          <input
            type="password"
            name="passwordConfirm"
            value={form.passwordConfirm}
            onChange={handleChange}
            required
            placeholder="비밀번호를 다시 입력하세요"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          {errors.passwordConfirm && <p className="mt-1 text-xs text-red-500">{errors.passwordConfirm}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="홍길동"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="010-0000-0000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "가입 중..." : "회원가입"}
        </button>

        <p className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-rose-600 hover:underline">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}
