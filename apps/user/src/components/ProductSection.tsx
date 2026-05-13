"use client";

import { useState } from "react";
import { type ProductResponse } from "@/api/user";
import ProductCard from "./ProductCard";

const ITEMS_PER_PAGE = 6;

interface ProductSectionProps {
  products: ProductResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export default function ProductSection({ products, isLoading, isError }: ProductSectionProps) {
  const [page, setPage] = useState(0);

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-52 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-500">
        상품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  if (!products || products.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-12">
        등록된 상품이 없습니다.
      </p>
    );
  }

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginated = products.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
                  i === page
                    ? "bg-rose-500 text-white"
                    : "text-gray-500 hover:bg-gray-100"
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
