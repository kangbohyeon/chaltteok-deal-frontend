"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { getOpenDailyStocks, placeOrder, type OpenDailyStockResponse } from "@/api/user";

export default function OrderPage() {
  const router = useRouter();
  const [stocks, setStocks] = useState<OpenDailyStockResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOpenDailyStocks()
      .then((data) => {
        setStocks(data);
        if (data.length > 0) setSelectedId(String(data[0].id));
      })
      .catch(() => setFetchError("이벤트 목록을 불러오지 못했습니다."));
  }, []);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await placeOrder({ dailyStockId: Number(selectedId) });
      router.push("/checkout/complete?type=event");
    } catch (err: unknown) {
      let msg = "주문 요청에 실패했습니다. 다시 시도해주세요.";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        const data = (err.response as { data?: { errorMessage?: string } }).data;
        if (data?.errorMessage) msg = data.errorMessage;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedStock = stocks.find((s) => String(s.id) === selectedId);

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8">
        <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 mb-3">
          한정 수량
        </span>
        <h1 className="text-2xl font-bold text-gray-900">이벤트 참여</h1>
        <p className="mt-1 text-sm text-gray-500">오늘 오픈된 이벤트 상품을 선택하고 참여하세요.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이벤트 상품 선택 *</label>
          {fetchError ? (
            <p className="text-sm text-red-500">{fetchError}</p>
          ) : stocks.length === 0 ? (
            <p className="text-sm text-gray-400">진행 중인 이벤트가 없습니다.</p>
          ) : (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
              className="w-full rounded-lg border text-black border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
            >
              {stocks.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.productName} — 남은 수량: {s.remainStock}개
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedStock && (
          <div className="rounded-lg bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700 space-y-1">
            <p>
              가격: <span className="font-semibold">{selectedStock.price.toLocaleString()}원</span>
            </p>
            <p>
              판매일: <span className="font-semibold">{selectedStock.saleDate}</span>
            </p>
            <p>
              재고: {selectedStock.remainStock} / {selectedStock.totalStock}개
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || stocks.length === 0}
          className="w-full rounded-lg bg-rose-500 py-3 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "요청 중..." : "🎉 지금 바로 참여하기"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-400">
        1인 1회 참여 가능 · 재고 소진 시 자동 마감
      </p>
    </div>
  );
}
