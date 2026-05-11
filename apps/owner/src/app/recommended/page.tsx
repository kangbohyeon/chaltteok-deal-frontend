"use client";

import { useEffect, useState } from "react";
import { getProducts, toggleRecommend, type ProductResponse } from "@/api/owner";

export default function RecommendedManagePage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError("상품 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (product: ProductResponse) => {
    setToggling(product.id);
    try {
      await toggleRecommend(product.id);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isRecommended: !p.isRecommended } : p
        )
      );
    } catch {
      alert("추천 상태 변경에 실패했습니다.");
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">추천 상품 관리</h1>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {products.length === 0 ? (
        <p className="text-sm text-gray-400">등록된 상품이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
            >
              <div>
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">{product.price.toLocaleString()}원</p>
              </div>
              <button
                onClick={() => handleToggle(product)}
                disabled={toggling === product.id}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                  product.isRecommended
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "border border-gray-300 text-gray-600 hover:border-amber-400 hover:text-amber-500"
                }`}
              >
                {toggling === product.id
                  ? "처리 중..."
                  : product.isRecommended
                  ? "추천 중 ✓"
                  : "추천 설정"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
