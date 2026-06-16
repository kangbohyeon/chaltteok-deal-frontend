"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type ProductResponse } from "@/api/user";
import { useCartStore } from "@chaltteok/shared-store";
import { Pagination } from "@chaltteok/shared-ui";
import ProductCard from "./ProductCard";

const ITEMS_PER_PAGE = 6;
const MAX_PREVIEW = 8;

type SortOption = "default" | "sales" | "name" | "rating";
type SortDir = "asc" | "desc";

const SORT_LABELS: Record<SortOption, string> = {
  default: "기본순",
  sales: "판매량순",
  name: "이름순",
  rating: "별점순",
};

interface ProductSectionProps {
  products: ProductResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
  query: string;
}

interface SearchRowProps {
  product: ProductResponse;
  onAddToCart: (product: ProductResponse) => void;
}

function SearchRow({ product, onAddToCart }: SearchRowProps) {
  const rowContent = (
    <div
      aria-disabled={product.soldOut}
      className={`flex items-center gap-3 border-b border-gray-100 px-4 py-3 transition-colors last:border-b-0 ${
        product.soldOut ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-50"
      }`}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            unoptimized
            className={`object-cover ${product.soldOut ? "grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl text-gray-300">
            🛍
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-medium text-gray-800">{product.name}</p>
          {product.recommended && !product.soldOut && (
            <span className="shrink-0 rounded-full bg-rose-100 px-1.5 py-0.5 text-xs font-semibold text-rose-600">
              추천
            </span>
          )}
          {product.soldOut && (
            <span className="shrink-0 rounded-full bg-red-50 px-1.5 py-0.5 text-xs text-red-500">
              품절
            </span>
          )}
        </div>
        <p className="text-sm font-bold text-gray-900">{product.price.toLocaleString()}원</p>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAddToCart(product);
        }}
        disabled={product.soldOut}
        aria-label={`${product.name} 장바구니 담기`}
        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors ${
          product.soldOut ? "cursor-not-allowed bg-gray-300" : "bg-rose-500 hover:bg-rose-600"
        }`}
      >
        담기
      </button>
    </div>
  );

  if (product.soldOut) return rowContent;

  return (
    <Link href={`/products/${product.productUuid}`} className="block">
      {rowContent}
    </Link>
  );
}

export default function ProductSection({
  products,
  isLoading,
  isError,
  query,
}: ProductSectionProps) {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortOption>("default");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSortClick = (s: SortOption) => {
    if (s === sort && s !== "default") {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(s);
      setSortDir("asc");
    }
  };
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
  }, [query]);

  const filtered = useMemo(
    () =>
      query.trim()
        ? (products ?? [])
            .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
            .slice(0, MAX_PREVIEW)
        : [],
    [products, query]
  );

  const sorted = useMemo(() => {
    if (!products || query.trim()) return products ?? [];
    const dir = sortDir === "asc" ? 1 : -1;
    return [...products].sort((a, b) => {
      switch (sort) {
        case "sales":
          return dir * (b.salesCount - a.salesCount);
        case "name":
          return dir * a.name.localeCompare(b.name, "ko");
        case "rating":
          return dir * ((b.averageRating ?? 0) - (a.averageRating ?? 0));
        default:
          return 0;
      }
    });
  }, [products, sort, sortDir, query]);

  const handleAddToCart = useCallback(
    (product: ProductResponse) => {
      if (product.soldOut) return;
      addItem({
        productUuid: product.productUuid,
        name: product.name,
        price: product.price,
        thumbnailUrl: product.thumbnailUrl,
      });
    },
    [addItem]
  );

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
        상품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  if (!products || products.length === 0) {
    return <p className="py-12 text-center text-sm text-gray-400">등록된 상품이 없습니다.</p>;
  }

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {query.trim() && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {filtered.length > 0 ? (
            filtered.map((product) => (
              <SearchRow
                key={product.productUuid}
                product={product}
                onAddToCart={handleAddToCart}
              />
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
          <div className="flex flex-wrap gap-2">
            {(["default", "sales", "name", "rating"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleSortClick(s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  sort === s
                    ? "border-rose-400 bg-rose-50 text-rose-600"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {SORT_LABELS[s]}
                {sort === s && s !== "default" && (
                  <span className="ml-0.5">{sortDir === "asc" ? " ↑" : " ↓"}</span>
                )}
              </button>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((product) => (
              <ProductCard key={product.productUuid} product={product} />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
