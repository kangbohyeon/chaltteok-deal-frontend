"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "@chaltteok/shared-ui";
import { getOwnerOrders, type OwnerOrderStatus, type OwnerOrderSummaryResponse } from "@/api/owner";

const STATUS_TABS: { label: string; value: OwnerOrderStatus | undefined }[] = [
  { label: "전체", value: undefined },
  { label: "완료", value: "COMPLETED" },
  { label: "대기", value: "PENDING" },
  { label: "취소", value: "CANCELLED" },
];

const STATUS_COLOR: Record<OwnerOrderStatus, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const ORDER_STATUS_LABEL: Record<OwnerOrderStatus, string> = {
  COMPLETED: "완료",
  PENDING: "대기",
  CANCELLED: "취소",
};

function OrderStatusBadge({ status }: { status: OwnerOrderStatus }) {
  const colorClass = STATUS_COLOR[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}
    >
      {ORDER_STATUS_LABEL[status] ?? status}
    </span>
  );
}

function formatKRW(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function OwnerOrderListPage() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<OwnerOrderStatus | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [activePreset, setActivePreset] = useState<string>("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["owner", "orders", activeStatus, page, startDate, endDate],
    queryFn: () =>
      getOwnerOrders(activeStatus, page, 20, startDate || undefined, endDate || undefined),
  });

  const handleTabChange = (value: OwnerOrderStatus | undefined) => {
    setActiveStatus(value);
    setPage(0);
  };

  const handlePreset = (preset: "today" | "week" | "month") => {
    const today = new Date();
    const from = new Date();
    if (preset === "today") {
      // from = today (no change)
    } else if (preset === "week") {
      from.setDate(today.getDate() - 6);
    } else {
      from.setMonth(today.getMonth() - 1);
    }
    setStartDate(toDateString(from));
    setEndDate(toDateString(today));
    setActivePreset(preset);
    setPage(0);
  };

  const handleDateChange = (type: "start" | "end", value: string) => {
    if (type === "start") setStartDate(value);
    else setEndDate(value);
    setActivePreset("custom");
    setPage(0);
  };

  const handleResetDate = () => {
    setStartDate("");
    setEndDate("");
    setActivePreset("");
    setPage(0);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900">주문 관리</h1>

      {/* 상태 필터 탭 */}
      <div className="mb-6 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeStatus === tab.value
                ? "bg-rose-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 기간 필터 */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {(["today", "week", "month"] as const).map((preset) => {
          const PRESET_LABEL = { today: "오늘", week: "1주일", month: "1개월" };
          return (
            <button
              key={preset}
              onClick={() => handlePreset(preset)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activePreset === preset
                  ? "bg-rose-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {PRESET_LABEL[preset]}
            </button>
          );
        })}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange("start", e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:ring-2 focus:ring-rose-400 focus:outline-none"
          />
          <span className="text-xs text-gray-400">~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange("end", e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:ring-2 focus:ring-rose-400 focus:outline-none"
          />
        </div>
        {(startDate || endDate) && (
          <button onClick={handleResetDate} className="text-xs text-gray-400 hover:text-gray-600">
            초기화
          </button>
        )}
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      )}

      {/* 에러 */}
      {isError && <p className="text-sm text-red-500">주문 목록을 불러오지 못했습니다.</p>}

      {/* 주문 목록 */}
      {data && (
        <>
          {data.content.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">주문이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {data.content.map((order) => (
                <div
                  key={order.orderNumber}
                  onClick={() => router.push(`/orders/${order.orderNumber}`)}
                  className="cursor-pointer rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {order.productName}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-gray-400">{order.orderNumber}</p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-rose-600">
                      {formatKRW(order.totalPrice)}
                    </span>
                    <span className="text-xs text-gray-400">{formatDateTime(order.orderedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          <div className="mt-8">
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">
            총 {data.totalElements.toLocaleString()}건
          </p>
        </>
      )}
    </div>
  );
}
