"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import { type PaymentInfoResponse } from "@/api/user";

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

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  READY: "결제 준비",
  SUCCESS: "결제 완료",
  FAILED: "결제 실패",
  CANCELLED: "결제 취소",
};

function PaymentInfo({ payment }: { payment: PaymentInfoResponse }) {
  return (
    <div className="border-t border-gray-100 pt-3 space-y-1">
      <p className="text-xs font-semibold text-gray-500 mb-1.5">결제 정보</p>
      <div className="flex justify-between text-xs text-gray-600">
        <span>결제 상태</span>
        <span className="font-medium">{PAYMENT_STATUS_LABEL[payment.status] ?? payment.status}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>결제 금액</span>
        <span className="font-medium">{payment.amount.toLocaleString()}원</span>
      </div>
      {payment.pgProvider && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>결제 수단</span>
          <span className="font-medium">{payment.pgProvider}</span>
        </div>
      )}
      {payment.paymentMethod && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>결제 방식</span>
          <span className="font-medium">{payment.paymentMethod}</span>
        </div>
      )}
      {payment.paidAt && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>결제 일시</span>
          <span className="font-medium">{new Date(payment.paidAt).toLocaleString("ko-KR")}</span>
        </div>
      )}
    </div>
  );
}

const PAGE_SIZE = 10;

export default function OrderHistoryPage() {
  const [page, setPage] = useState(0);
  const [inputKeyword, setInputKeyword] = useState("");
  const [keyword, setKeyword] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  const { orders, totalPages, loading, error, cancelOrder } = useOrderHistory({
    page,
    size: PAGE_SIZE,
    keyword: keyword || undefined,
    status: statusFilter || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    paymentStatus: paymentStatusFilter || undefined,
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(0);
    setKeyword(inputKeyword.trim());
  };

  const handleCancel = async (orderNumber: string) => {
    if (!confirm("주문을 취소하시겠습니까?")) return;
    setCancellingOrder(orderNumber);
    setCancelError(null);
    try {
      await cancelOrder(orderNumber);
    } catch {
      setCancelError("주문 취소에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setCancellingOrder(null);
    }
  };

  const hasActiveFilters = Boolean(statusFilter || fromDate || toDate || paymentStatusFilter);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">주문 내역</h1>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputKeyword}
          onChange={(e) => setInputKeyword(e.target.value)}
          placeholder="주문번호로 검색 (예: ORD20260513...)"
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
        <button
          type="submit"
          className="rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
        >
          검색
        </button>
        {keyword && (
          <button
            type="button"
            onClick={() => {
              setInputKeyword("");
              setKeyword("");
              setPage(0);
            }}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            초기화
          </button>
        )}
      </form>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          <option value="">주문상태 전체</option>
          <option value="PENDING">결제 대기</option>
          <option value="COMPLETED">결제 완료</option>
          <option value="CANCELLED">취소됨</option>
          <option value="FAILED">실패</option>
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
        <span className="flex items-center text-sm text-gray-400">~</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
        />

        <select
          value={paymentStatusFilter}
          onChange={(e) => {
            setPaymentStatusFilter(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          <option value="">결제상태 전체</option>
          <option value="READY">결제 준비</option>
          <option value="SUCCESS">결제 완료</option>
          <option value="FAILED">결제 실패</option>
          <option value="CANCELLED">결제 취소</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setStatusFilter("");
              setFromDate("");
              setToDate("");
              setPaymentStatusFilter("");
              setPage(0);
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            필터 초기화
          </button>
        )}
      </div>

      {cancelError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
          {cancelError}
        </div>
      )}

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
          <p className="text-gray-500 mb-6">
            {keyword || statusFilter || fromDate || toDate || paymentStatusFilter
              ? "조건에 해당하는 주문이 없습니다."
              : "주문 내역이 없습니다."}
          </p>
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
            key={order.orderNumber}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800 font-mono tracking-wide">
                  {`주문번호 : ${order.orderNumber}`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.orderedAt).toLocaleString("ko-KR")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-500"}`}
                >
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
                {order.canCancel && (
                  <button
                    onClick={() => handleCancel(order.orderNumber)}
                    disabled={cancellingOrder === order.orderNumber}
                    className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 hover:border-red-300 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {cancellingOrder === order.orderNumber ? "처리중..." : "취소"}
                  </button>
                )}
              </div>
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

            {order.payment && <PaymentInfo payment={order.payment} />}
          </li>
        ))}
      </ul>

      {/* 페이징 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg px-3 py-1.5 text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                  i === page ? "bg-rose-500 text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="rounded-lg px-3 py-1.5 text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
