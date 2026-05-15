"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { type ProductResponse } from "@/api/user";
import { useCartStore } from "@chaltteok/shared-store";
import ProductCard from "./ProductCard";

const ITEMS_PER_PAGE = 6;
const MAX_PREVIEW = 8;

interface ProductSectionProps {
  products: ProductResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
  query: string;
}

export default function ProductSection({ products, isLoading, isError, query }: ProductSectionProps) {
  const [page, setPage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    setPage(0);
  }, [query]);

  const filtered = query.trim()
    ? (products ?? [])
        .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
        .slice(0, MAX_PREVIEW)
    : [];

  const handleAddToCart = useCallback(
    (product: ProductResponse) => {
      if (product.soldOut) return;
      addItem({
        productId: product.id,
        productUuid: product.productUuid,
        name: product.name,
        price: product.price,
        thumbnailUrl: product.thumbnailUrl,
      });
    },
    [addItem],
  );

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
      <p className="text-center text-sm text-gray-400 py-12">등록된 상품이 없습니다.</p>
    );
  }

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginated = products.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {query.trim() && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {filtered.length > 0 ? (
            filtered.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  {product.thumbnailUrl ? (
                    <Image
                      src={product.thumbnailUrl}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">
                      🛍
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                    {product.soldOut && (
                      <span className="shrink-0 text-xs text-red-500 bg-red-50 rounded-full px-1.5 py-0.5">
                        품절
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {product.price.toLocaleString()}원
                  </p>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.soldOut}
                  aria-label={`${product.name} 장바구니 담기`}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors ${
                    product.soldOut ? "bg-gray-300 cursor-not-allowed" : "bg-rose-500 hover:bg-rose-600"
                  }`}
                >
                  담기
                </button>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              &quot;{query}&quot;에 해당하는 상품이 없습니다.
            </div>
          )}
        </div>
      )}

      {!query.trim() && (
        <>
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
        </>
      )}
    </div>
  );
}
