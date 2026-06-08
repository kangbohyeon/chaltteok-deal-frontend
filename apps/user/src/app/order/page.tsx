"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getOpenDailyStocks, placeOrder, type OpenDailyStockResponse } from "@/api/user";
import { getApiErrorMessage } from "@/lib/error";

function OrderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stockIdParam = searchParams.get("stockId");
  const [stocks, setStocks] = useState<OpenDailyStockResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOpenDailyStocks()
      .then((data) => {
        setStocks(data);
        const target = stockIdParam ? data.find((s) => s.uuid === stockIdParam) : data[0];
        if (target) setSelectedId(target.uuid);
      })
      .catch(() => setFetchError("이벤트 목록을 불러오지 못했습니다."));
  }, [stockIdParam]);

  const selectedStock = stocks.find((s) => s.uuid === selectedId);

  const maxQty = selectedStock
    ? selectedStock.maxPurchaseCount !== null
      ? Math.min(selectedStock.remainStock, selectedStock.maxPurchaseCount)
      : selectedStock.remainStock
    : 1;

  const handleSelectChange = (uuid: string) => {
    setSelectedId(uuid);
    setQuantity(1);
  };

  const handleQtyChange = (delta: number) => {
    setQuantity((q) => Math.max(1, Math.min(maxQty, q + delta)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await placeOrder({ stockUuid: selectedId, quantity });
      router.push(`/checkout/complete?orderId=${result.orderId}&amount=${result.totalAmount}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err) ?? "주문 요청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = selectedStock ? selectedStock.price * quantity : 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8">
        <span className="mb-3 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
          한정 수량
        </span>
        <h1 className="text-2xl font-bold text-gray-900">이벤트 상품 구매</h1>
        <p className="mt-1 text-sm text-gray-500">한정 수량 이벤트 상품을 구매하세요.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        {/* 상품 선택 (stockId 없을 때만 드롭다운 표시) */}
        {!stockIdParam && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">상품 선택 *</label>
            {fetchError ? (
              <p className="text-sm text-red-500">{fetchError}</p>
            ) : stocks.length === 0 ? (
              <p className="text-sm text-gray-400">진행 중인 이벤트가 없습니다.</p>
            ) : (
              <select
                value={selectedId}
                onChange={(e) => handleSelectChange(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
              >
                {stocks.map((s) => (
                  <option key={s.uuid} value={s.uuid}>
                    {s.productName} — 남은 수량: {s.remainStock}개
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {fetchError && stockIdParam && <p className="text-sm text-red-500">{fetchError}</p>}

        {selectedStock && (
          <>
            {/* 상품 정보 */}
            <div className="space-y-1 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <p className="text-base font-semibold text-rose-800">{selectedStock.productName}</p>
              <p>
                단가:{" "}
                <span className="font-semibold">{selectedStock.price.toLocaleString()}원</span>
              </p>
              <p>
                판매일: <span className="font-semibold">{selectedStock.saleDate}</span>
              </p>
              <p>
                남은 재고: <span className="font-semibold">{selectedStock.remainStock}</span> /{" "}
                {selectedStock.totalStock}개
              </p>
              {selectedStock.maxPurchaseCount !== null ? (
                <p>
                  1인 최대: <span className="font-semibold">{selectedStock.maxPurchaseCount}</span>
                  개
                </p>
              ) : (
                <p>구매 수량 제한 없음</p>
              )}
            </div>

            {/* 수량 선택 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">수량</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleQtyChange(-1)}
                  disabled={quantity <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-lg font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-10 text-center text-lg font-bold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQtyChange(1)}
                  disabled={quantity >= maxQty}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-lg font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            {/* 총 금액 */}
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">총 금액</span>
              <span className="text-lg font-bold text-rose-600">
                {totalPrice.toLocaleString()}원
              </span>
            </div>
          </>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedStock || selectedStock.remainStock === 0}
          className="w-full rounded-lg bg-rose-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
        >
          {loading ? "처리 중..." : `${totalPrice.toLocaleString()}원 바로구매`}
        </button>
      </form>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">불러오는 중...</div>}>
      <OrderPageContent />
    </Suspense>
  );
}
