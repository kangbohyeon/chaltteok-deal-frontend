"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@chaltteok/shared-store";
import { checkout } from "@/api/user";
import { PAYMENT_METHODS } from "@/constants/payment";
import { getApiErrorMessage } from "@/lib/error";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="mb-4 text-4xl">🛒</p>
        <h2 className="mb-2 text-xl font-bold text-gray-900">장바구니가 비어있습니다</h2>
        <p className="mb-8 text-sm text-gray-500">상품을 먼저 담아주세요.</p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
        >
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await checkout({
        items: items.map((item) => ({
          productUuid: item.productUuid,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: totalPrice(),
        paymentMethod,
      });
      clearCart();
      router.push(`/checkout/complete?orderId=${result.orderId}&amount=${result.totalAmount}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err) ?? "결제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">결제하기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 주문 상품 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">주문 상품</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.productUuid} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100" />
                  )}
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-gray-400">× {item.quantity}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {(item.price * item.quantity).toLocaleString()}원
                </span>
              </li>
            ))}
          </ul>
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

        {/* 결제 금액 */}
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">결제 금액</h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>상품 합계</span>
            <span>{totalPrice().toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>배송비</span>
            <span className="text-rose-500">무료</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-3 font-bold text-gray-900">
            <span>총 결제 금액</span>
            <span className="text-xl text-rose-500">{totalPrice().toLocaleString()}원</span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-rose-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
        >
          {loading ? "결제 처리 중..." : `${totalPrice().toLocaleString()}원 결제하기`}
        </button>

        <Link
          href="/cart"
          className="block text-center text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          장바구니로 돌아가기
        </Link>
      </form>
    </div>
  );
}
