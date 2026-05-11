"use client";

import { useEffect, useState } from "react";
import {
  getProducts,
  registerDailyStock,
  type DailyStockRegisterRequest,
  type ProductResponse,
} from "@/api/owner";

const today = new Date().toISOString().split("T")[0];

const makeInitial = (products: ProductResponse[]): DailyStockRegisterRequest => ({
  productId: products[0]?.id ?? 0,
  saleDate: today,
  totalStock: 1,
  maxPurchaseCount: 1,
});

export default function StockRegisterPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [form, setForm] = useState<DailyStockRegisterRequest>({
    productId: 0,
    saleDate: today,
    totalStock: 1,
    maxPurchaseCount: 1,
  });
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
        if (data.length > 0) {
          setForm((prev) => ({ ...prev, productId: data[0].id }));
        }
      })
      .catch(() => setFetchError("상품 목록을 불러오지 못했습니다."));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "saleDate" ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerDailyStock(form);
      alert("일일 재고 등록 성공");
      setForm(makeInitial(products));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "재고 등록에 실패했습니다. 다시 시도해주세요.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">일일 재고 등록</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-8"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상품 선택 *</label>
          {fetchError ? (
            <p className="text-sm text-red-500">{fetchError}</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-gray-400">상품을 불러오는 중...</p>
          ) : (
            <select
              name="productId"
              value={form.productId}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.price.toLocaleString()}원
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">판매 날짜 *</label>
          <input
            name="saleDate"
            type="date"
            min={today}
            value={form.saleDate}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">총 재고 수량 *</label>
          <input
            name="totalStock"
            type="number"
            min={1}
            value={form.totalStock}
            onChange={handleChange}
            required
            placeholder="ex. 100"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">1인 구매 가능 횟수 *</label>
          <input
            name="maxPurchaseCount"
            type="number"
            min={1}
            value={form.maxPurchaseCount}
            onChange={handleChange}
            required
            placeholder="ex. 1"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || products.length === 0}
          className="w-full rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "등록 중..." : "재고 등록"}
        </button>
      </form>
    </div>
  );
}
