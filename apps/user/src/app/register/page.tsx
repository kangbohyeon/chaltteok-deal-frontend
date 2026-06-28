"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, checkEmailDuplicate } from "@/api/user";
import { getApiErrorMessage } from "@/lib/error";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{10,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserRegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [consents, setConsents] = useState({
    termsAgreed: false,
    privacyAgreed: false,
    ageAgreed: false,
    marketingAgreed: false,
    pushAgreed: false,
  });
  const router = useRouter();

  const allRequiredConsented = consents.termsAgreed && consents.privacyAgreed && consents.ageAgreed;
  const allConsented = allRequiredConsented && consents.marketingAgreed && consents.pushAgreed;

  const handleConsentChange = (key: keyof typeof consents) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAllConsent = () => {
    const next = !allConsented;
    setConsents({
      termsAgreed: next,
      privacyAgreed: next,
      ageAgreed: next,
      marketingAgreed: next,
      pushAgreed: next,
    });
  };

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
      next.password =
        "대문자 1자 이상, 숫자 1자 이상, 특수문자 1자 이상, 10자리 이상이어야 합니다.";
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
      await registerUser({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        termsAgreed: consents.termsAgreed,
        privacyAgreed: consents.privacyAgreed,
        ageAgreed: consents.ageAgreed,
        marketingAgreed: consents.marketingAgreed,
        pushAgreed: consents.pushAgreed,
      });
      router.push("/login");
    } catch (err: unknown) {
      setServerError(getApiErrorMessage(err) ?? "회원가입에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading ||
    !emailChecked ||
    !form.password ||
    !form.passwordConfirm ||
    !form.name ||
    !form.phone ||
    !allRequiredConsented;

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
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
          <label className="mb-1 block text-sm font-medium text-gray-700">이메일</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
              className={`flex-1 rounded-lg border px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none ${
                emailChecked ? "border-green-400 bg-green-50" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={handleEmailCheck}
              disabled={emailCheckLoading || !form.email}
              className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-rose-400 hover:text-rose-500 disabled:opacity-50"
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
          <label className="mb-1 block text-sm font-medium text-gray-700">비밀번호</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="대문자·숫자·특수문자 포함 10자 이상"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">비밀번호 확인</label>
          <input
            type="password"
            name="passwordConfirm"
            value={form.passwordConfirm}
            onChange={handleChange}
            required
            placeholder="비밀번호를 다시 입력하세요"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
          />
          {errors.passwordConfirm && (
            <p className="mt-1 text-xs text-red-500">{errors.passwordConfirm}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">이름</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="홍길동"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">전화번호</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="010-0000-0000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
          />
        </div>

        {/* 동의 항목 */}
        <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
          {/* 전체 동의 */}
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={allConsented}
              onChange={handleAllConsent}
              className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400"
            />
            <span className="text-sm font-semibold text-gray-800">전체 동의</span>
          </label>
          <hr className="border-gray-200" />

          {/* 필수 항목 */}
          <p className="text-xs font-medium text-gray-500">필수 동의</p>
          {[
            { key: "termsAgreed" as const, label: "서비스 이용약관 동의" },
            { key: "privacyAgreed" as const, label: "개인정보 처리방침 동의" },
            { key: "ageAgreed" as const, label: "만 14세 이상 확인" },
          ].map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={consents[key]}
                onChange={() => handleConsentChange(key)}
                className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400"
              />
              <span className="text-sm text-gray-700">
                {label} <span className="text-rose-500">(필수)</span>
              </span>
            </label>
          ))}

          {/* 선택 항목 */}
          <p className="text-xs font-medium text-gray-500">선택 동의</p>
          {[
            { key: "marketingAgreed" as const, label: "마케팅/이벤트 알림 수신 동의" },
            { key: "pushAgreed" as const, label: "푸시 알림 수신 동의" },
          ].map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={consents[key]}
                onChange={() => handleConsentChange(key)}
                className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400"
              />
              <span className="text-sm text-gray-700">
                {label} <span className="text-gray-400">(선택)</span>
              </span>
            </label>
          ))}
        </div>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
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
