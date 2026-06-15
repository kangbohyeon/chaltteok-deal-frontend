"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getOwnerOrderDetail,
  type OwnerOrderDetailResponse,
  type OwnerOrderItemResponse,
} from "@/api/owner";

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

const ORDER_STATUS_LABEL: Record<string, string> = {
  COMPLETED: "완료",
  PENDING: "대기",
  CANCELLED: "취소",
};

function OrderStatusBadge({ status }: { status: string }) {
  const colorClass =
    status === "COMPLETED"
      ? "bg-green-100 text-green-700"
      : status === "PENDING"
        ? "bg-yellow-100 text-yellow-700"
        : status === "CANCELLED"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}
    >
      {ORDER_STATUS_LABEL[status] ?? status}
    </span>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-500">{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{children}</span>
    </div>
  );
}

export default function OwnerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = typeof params.orderNumber === "string" ? params.orderNumber : "";

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery<OwnerOrderDetailResponse>({
    queryKey: ["owner", "order", orderNumber],
    queryFn: () => getOwnerOrderDetail(orderNumber),
    enabled: Boolean(orderNumber),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-44 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-44 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <span>←</span>
          <span>뒤로가기</span>
        </button>
        <p className="text-sm text-red-500">주문 정보를 불러오지 못했습니다.</p>
      </div>
    );
  }

  const handleCancel = () => {
    console.warn("TODO: 주문 취소 API 연동");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      {/* 상단 헤더 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <span>←</span>
          <span>뒤로가기</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900">주문 상세</h1>
      </div>

      {/* 주문 정보 카드 */}
      <SectionCard title="주문 정보">
        <div className="divide-y divide-gray-100">
          <InfoRow label="주문번호">
            <span className="font-mono text-xs">{order.orderNumber}</span>
          </InfoRow>
          <InfoRow label="주문 상태">
            <OrderStatusBadge status={order.status} />
          </InfoRow>
          <InfoRow label="주문 일시">{formatDateTime(order.orderedAt)}</InfoRow>
          <InfoRow label="총 금액">
            <span className="font-bold text-rose-600">{formatKRW(order.totalPrice)}</span>
          </InfoRow>
        </div>
      </SectionCard>

      {/* 상품 정보 카드 */}
      <SectionCard title="상품 정보">
        <div className="space-y-3">
          {order.items.map((item: OwnerOrderItemResponse, index: number) => (
            <div
              key={item.productName + "-" + index}
              className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{item.productName}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {formatKRW(item.price)} × {item.quantity}개
                </p>
              </div>
              <p className="ml-4 shrink-0 text-sm font-semibold text-gray-900">
                {formatKRW(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 결제 정보 카드 */}
      {order.payment && (
        <SectionCard title="결제 정보">
          <div className="divide-y divide-gray-100">
            <InfoRow label="결제 수단">{order.payment.paymentMethod}</InfoRow>
            <InfoRow label="결제 상태">{order.payment.status}</InfoRow>
            <InfoRow label="결제 금액">{formatKRW(order.payment.amount)}</InfoRow>
            <InfoRow label="결제 일시">
              {order.payment.paidAt ? formatDateTime(order.payment.paidAt) : "-"}
            </InfoRow>
          </div>
        </SectionCard>
      )}

      {/* 주문 취소 버튼 */}
      {order.canCancel && (
        <button
          onClick={handleCancel}
          disabled
          className="w-full rounded-2xl border border-red-200 bg-red-50 py-3.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          주문 취소
        </button>
      )}
    </div>
  );
}
