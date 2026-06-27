"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getOpenTimeSaleStocks,
  placeOrder,
  validateCoupon,
  type OpenTimeSaleStockResponse,
  type PaymentMethod,
  type CouponValidateResponse,
} from "@/api/user";
import { PAYMENT_METHODS } from "@/constants/payment";
import { getApiErrorMessage } from "@/lib/error";
import { useRequireAuth } from "@/hooks/useRequireAuth";

function ErrorFallback({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="mb-6 text-sm text-red-500">{message}</p>
      <Link
        href="/order"
        className="inline-block rounded-lg bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
      >
        이벤트 목록으로
      </Link>
    </div>
  );
}

function OrderCheckoutContent() {
  const router = useRouter();
  const isAuthenticated = useRequireAuth();
  const searchParams = useSearchParams();
  const stockId = searchParams.get("stockId") ?? "";
  const rawQty = Number(searchParams.get("qty") ?? "1");

  const [stock, setStock] = useState<OpenTimeSaleStockResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0].value);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidateResponse | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (!stockId) return;
    getOpenTimeSaleStocks()
      .then((data) => {
        const found = data.find((s) => s.uuid === stockId);
        if (!found) {
          setFetchError("해당 이벤트 상품을 찾을 수 없습니다.");
        } else {
          setStock(found);
        }
      })
      .catch(() => setFetchError("상품 정보를 불러오지 못했습니다."));
  }, [stockId]);

  if (!isAuthenticated) return null;

  if (!stockId) {
    return <ErrorFallback message="잘못된 접근입니다." />;
  }

  if (fetchError) {
    return <ErrorFallback message={fetchError} />;
  }

  if (!stock) {
    return <div className="py-20 text-center text-gray-400">불러오는 중...</div>;
  }

  const maxQty =
    stock.maxPurchaseCount !== null
      ? Math.min(stock.remainStock, stock.maxPurchaseCount)
      : stock.remainStock;
  const quantity = Number.isFinite(rawQty) ? Math.max(1, Math.min(maxQty, rawQty)) : 1;
  const totalPrice = stock.price * quantity;
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const finalPrice = totalPrice - discountAmount;
  const formattedTotal = totalPrice.toLocaleString();
  const formattedFinal = finalPrice.toLocaleString();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("쿠폰 코드를 입력해주세요.");
      return;
    }
    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(couponCode.trim(), totalPrice);
      setAppliedCoupon(result);
    } catch (err: unknown) {
      setCouponError(getApiErrorMessage(err) ?? "유효하지 않은 쿠폰 코드입니다.");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCancelCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setLoading(true);
    try {
      await placeOrder({
        stockUuid: stockId,
        quantity,
        paymentMethod,
        couponCode: appliedCoupon ? couponCode.trim() : undefined,
      });
      router.push(`/checkout/complete?type=event&amount=${finalPrice}`);
    } catch (err: unknown) {
      setSubmitError(getApiErrorMessage(err) ?? "주문 요청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">결제하기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 주문 상품 정보 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">주문 상품</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">상품명</span>
              <span className="font-semibold text-gray-900">{stock.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">판매일</span>
              <span>{stock.saleDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">단가</span>
              <span>{stock.price.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">수량</span>
              <span>{quantity}개</span>
            </div>
          </div>
        </div>

        {/* 결제 수단 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">결제 수단</h2>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  paymentMethod === method.value
                    ? "border-rose-400 bg-rose-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={() => setPaymentMethod(method.value)}
                  className="accent-rose-500"
                />
                <span className="text-sm font-medium text-gray-700">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 쿠폰 코드 입력 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">쿠폰 코드</h2>
          {appliedCoupon ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm font-semibold text-green-800">{appliedCoupon.couponName}</p>
                <p className="mt-1 text-sm text-green-700">
                  할인 금액: {appliedCoupon.discountAmount.toLocaleString()}원
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelCoupon}
                className="text-sm text-gray-400 transition-colors hover:text-red-500"
              >
                적용된 쿠폰 취소
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="쿠폰 코드 입력"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-black uppercase focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
                >
                  {couponLoading ? "확인 중..." : "적용"}
                </button>
              </div>
              {couponError && <p className="text-xs text-red-500">{couponError}</p>}
            </div>
          )}
        </div>

        {/* 결제 금액 */}
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">결제 금액</h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>상품 합계</span>
            <span>{formattedTotal}원</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-sm text-green-600">
              <span>쿠폰 할인</span>
              <span>-{appliedCoupon.discountAmount.toLocaleString()}원</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>배송비</span>
            <span className="text-rose-500">무료</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-3 font-bold text-gray-900">
            <span>총 결제 금액</span>
            <span className="text-xl text-rose-500">{formattedFinal}원</span>
          </div>
        </div>

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || stock.remainStock === 0}
          className="w-full rounded-lg bg-rose-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
        >
          {loading ? "결제 처리 중..." : `${formattedFinal}원 결제하기`}
        </button>

        <Link
          href="/order"
          className="block text-center text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          이벤트 목록으로 돌아가기
        </Link>
      </form>
    </div>
  );
}

export default function OrderCheckoutPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">불러오는 중...</div>}>
      <OrderCheckoutContent />
    </Suspense>
  );
}
