"use client";

import { useState } from "react";
import { registerProduct, type ProductRegisterRequest } from "@/api/owner";

const INITIAL: ProductRegisterRequest = { name: "", price: 0, description: "" };

export default function ProductRegisterPage() {
  const [form, setForm] = useState<ProductRegisterRequest>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "price" ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerProduct(form);
      alert("상품 등록 성공");
      setForm(INITIAL);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "상품 등록에 실패했습니다. 다시 시도해주세요.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">상품 등록</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상품명 *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="ex. 한우 등심 200g"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원) *</label>
          <input
            name="price"
            type="number"
            min={0}
            value={form.price}
            onChange={handleChange}
            required
            placeholder="ex. 29000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상품 설명</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="상품에 대한 간단한 설명을 입력해주세요."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "등록 중..." : "상품 등록"}
        </button>
      </form>
    </div>
  );
}
