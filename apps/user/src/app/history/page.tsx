"use client";

import Link from "next/link";
import { useOrderHistory } from "@/hooks/useOrderHistory";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "결제 대기",
  COMPLETED: "결제 완료",
  CANCELLED: "취소됨",
  FAILED: "실패",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
  FAILED: "bg-red-100 text-red-500",
};

export default function OrderHistoryPage() {
  const { orders, loading, error } = useOrderHistory();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">주문 내역</h1>

      {loading && (
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-gray-500 mb-6">주문 내역이 없습니다.</p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
          >
            쇼핑하러 가기
          </Link>
        </div>
      )}

      <ul className="space-y-4">
        {orders.map((order) => (
          <li
            key={order.orderUuid}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-mono">{order.orderUuid}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.orderedAt).toLocaleString("ko-KR")}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-500"}`}
              >
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
            </div>

            {order.items.length > 0 && (
              <ul className="space-y-2 border-t border-gray-100 pt-4">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between text-sm text-gray-700">
                    <span>
                      {item.productName}{" "}
                      <span className="text-gray-400">× {item.quantity}</span>
                    </span>
                    <span className="font-medium">
                      {(item.price * item.quantity).toLocaleString()}원
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="text-sm text-gray-500">합계</span>
              <span className="text-base font-bold text-rose-500">
                {order.totalPrice.toLocaleString()}원
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
