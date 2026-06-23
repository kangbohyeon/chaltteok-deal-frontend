"use client";

import { useState } from "react";
import {
  createCoupon,
  updateCoupon,
  type CouponRequest,
  type CouponResponse,
  type DiscountType,
} from "@/api/owner";

interface Props {
  mode: "create" | "edit";
  coupon?: CouponResponse;
  onClose: () => void;
  onSaved: () => void;
}

const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: "RATE", label: "정률 (%)" },
  { value: "AMOUNT", label: "정액 (원)" },
];

export default function CouponModal({ mode, coupon, onClose, onSaved }: Props) {
  const [name, setName] = useState(coupon?.name ?? "");
  const [code, setCode] = useState(coupon?.code ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(coupon?.discountType ?? "RATE");
  const [discountValue, setDiscountValue] = useState<string>(
    coupon?.discountValue != null ? String(coupon.discountValue) : ""
  );
  const [minOrderAmount, setMinOrderAmount] = useState<string>(
    coupon?.minOrderAmount != null ? String(coupon.minOrderAmount) : ""
  );
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>(
    coupon?.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : ""
  );
  const [totalQuantity, setTotalQuantity] = useState<string>(
    coupon?.totalQuantity != null ? String(coupon.totalQuantity) : ""
  );
  const [startDate, setStartDate] = useState(coupon?.startDate ?? "");
  const [endDate, setEndDate] = useState(coupon?.endDate ?? "");
  const [isActive, setIsActive] = useState(coupon?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body: CouponRequest = {
      name,
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount !== "" ? Number(minOrderAmount) : null,
      maxDiscountAmount:
        discountType === "RATE" && maxDiscountAmount !== "" ? Number(maxDiscountAmount) : null,
      totalQuantity: totalQuantity !== "" ? Number(totalQuantity) : null,
      startDate,
      endDate,
      isActive,
    };

    try {
      if (mode === "create") {
        await createCoupon(body);
      } else if (coupon) {
        await updateCoupon(coupon.couponUuid, body);
      }
      onSaved();
      onClose();
    } catch {
      setError("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-rose-500 px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            {mode === "create" ? "쿠폰 생성" : "쿠폰 수정"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="max-h-[80vh] space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">쿠폰명</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">쿠폰 코드</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              placeholder="예: SUMMER2024"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black uppercase focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">할인 타입</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-rose-400 focus:outline-none"
              >
                {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                할인값 {discountType === "RATE" ? "(%)" : "(원)"}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
                min={0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              최소 주문금액 (원, 선택)
            </label>
            <input
              type="number"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              min={0}
              placeholder="제한 없음"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
          </div>
          {discountType === "RATE" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                최대 할인금액 (원, 선택)
              </label>
              <input
                type="number"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                min={0}
                placeholder="제한 없음"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">총 수량 (선택)</label>
            <input
              type="number"
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(e.target.value)}
              min={1}
              placeholder="무제한"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-rose-400 focus:outline-none"
              />
            </div>
            <span className="mt-5 flex items-center text-sm text-gray-400">~</span>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-rose-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-rose-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              활성화
            </label>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
