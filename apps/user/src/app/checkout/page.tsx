"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@chaltteok/shared-store";
import { checkout } from "@/api/user";

const PAYMENT_METHODS = [
  { value: "CARD", label: "신용카드 / 체크카드" },
  { value: "TRANSFER", label: "계좌이체" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">장바구니가 비어있습니다</h2>
        <p className="text-sm text-gray-500 mb-8">상품을 먼저 담아주세요.</p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
        >
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await checkout({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: totalPrice(),
        paymentMethod,
      });
      clearCart();
      router.push(`/checkout/complete?orderId=${result.orderId}&amount=${result.totalAmount}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errorMessage?: string } } })?.response?.data?.errorMessage;
      setError(msg ?? "결제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">결제하기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 주문 상품 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">주문 상품</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                  )}
                  <span className="text-gray-800 font-medium">{item.name}</span>
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
          <h2 className="text-base font-semibold text-gray-900 mb-4">결제 수단</h2>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.value}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-base font-semibold text-gray-900">결제 금액</h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>상품 합계</span>
            <span>{totalPrice().toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>배송비</span>
            <span className="text-rose-500">무료</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
            <span>총 결제 금액</span>
            <span className="text-xl text-rose-500">{totalPrice().toLocaleString()}원</span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-rose-500 py-3.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "결제 처리 중..." : `${totalPrice().toLocaleString()}원 결제하기`}
        </button>

        <Link
          href="/cart"
          className="block text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          장바구니로 돌아가기
        </Link>
      </form>
    </div>
  );
}
