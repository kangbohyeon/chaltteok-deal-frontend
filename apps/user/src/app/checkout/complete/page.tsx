"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function CompleteContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const amount = params.get("amount");
  const isEvent = params.get("type") === "event";

  return (
    <div className="mx-auto max-w-sm px-4 py-20 text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 mb-6">
          <span className="text-4xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEvent ? "이벤트 참여 완료!" : "결제가 완료되었습니다!"}
        </h1>
        <p className="text-sm text-gray-500">
          {isEvent
            ? "이벤트 주문이 접수되었습니다. 재고 확인 후 처리됩니다."
            : "주문이 성공적으로 처리되었습니다."}
        </p>
      </div>

      {!isEvent && (orderId || amount) && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-8 text-left space-y-3">
          {orderId && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">주문번호</span>
              <span className="font-semibold text-gray-900">#{orderId}</span>
            </div>
          )}
          {amount && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">결제 금액</span>
              <span className="font-semibold text-rose-500">
                {Number(amount).toLocaleString()}원
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">결제 상태</span>
            <span className="font-semibold text-green-600">결제 완료</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="block rounded-lg bg-rose-500 py-3 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
        >
          홈으로 돌아가기
        </Link>
        <Link
          href="/cart"
          className="block rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:border-gray-300 transition-colors"
        >
          장바구니 보기
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutCompletePage() {
  return (
    <Suspense>
      <CompleteContent />
    </Suspense>
  );
}
