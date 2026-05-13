"use client";

import { useState } from "react";
import { type ProductResponse } from "@/api/user";
import ProductCard from "./ProductCard";

const VISIBLE_COUNT = 3;

interface Props {
  products: ProductResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export default function RecommendedSection({ products, isLoading, isError }: Props) {
  const [startIndex, setStartIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-red-500">추천 상품을 불러오지 못했습니다.</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-sm text-gray-400">현재 추천 상품이 없습니다.</p>;
  }

  const canPrev = startIndex > 0;
  const canNext = startIndex + VISIBLE_COUNT < products.length;
  const visible = products.slice(startIndex, startIndex + VISIBLE_COUNT);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length > VISIBLE_COUNT && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setStartIndex((i) => Math.max(0, i - 1))}
            disabled={!canPrev}
            aria-label="이전 추천 상품"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>
          <span className="text-xs text-gray-400">
            {startIndex + 1}–{Math.min(startIndex + VISIBLE_COUNT, products.length)} / {products.length}
          </span>
          <button
            onClick={() => setStartIndex((i) => Math.min(products.length - VISIBLE_COUNT, i + 1))}
            disabled={!canNext}
            aria-label="다음 추천 상품"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
