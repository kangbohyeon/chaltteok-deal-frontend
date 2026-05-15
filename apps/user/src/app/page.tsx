"use client";

import { useEffect, useRef, useState } from "react";
import { useOpenStocks } from "@/hooks/useOpenStocks";
import { useProducts } from "@/hooks/useProducts";
import { useRecommendedProducts } from "@/hooks/useRecommendedProducts";
import { useParticipatedStocks } from "@/hooks/useParticipatedStocks";
import EventStockSection from "@/components/EventStockSection";
import ProductSection from "@/components/ProductSection";
import RecommendedSection from "@/components/RecommendedSection";

export default function Home() {
  const { data: stocks, isLoading: isLoadingStocks, isError: isErrorStocks } = useOpenStocks();
  const { data: participatedIds = [] } = useParticipatedStocks();
  const { data: recommended, isLoading: isLoadingRecommended, isError: isErrorRecommended } = useRecommendedProducts();
  const { data: products, isLoading: isLoadingProducts, isError: isErrorProducts } = useProducts();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchOpen) setQuery("");
  }, [searchOpen]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 space-y-16">
      {stocks?.length !== 0 && (
        <section>
          <div className="mb-6">
            <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 mb-2">
              오늘만
            </span>
            <h2 className="text-2xl font-bold text-gray-900">오늘의 이벤트 상품</h2>
            <p className="mt-1 text-sm text-gray-500">매일 한정 수량으로 만나는 특별한 이벤트 딜</p>
          </div>
          <EventStockSection
            stocks={stocks}
            isLoading={isLoadingStocks}
            isError={isErrorStocks}
            participatedIds={participatedIds}
          />
        </section>
      )}

      <section>
        <div className="mb-6">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600 mb-2">
            점주 추천
          </span>
          <h2 className="text-2xl font-bold text-gray-900">추천 상품</h2>
          <p className="mt-1 text-sm text-gray-500">점주가 직접 추천하는 엄선된 상품입니다.</p>
        </div>
        <RecommendedSection
          products={recommended}
          isLoading={isLoadingRecommended}
          isError={isErrorRecommended}
        />
      </section>

      <section>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">일반 상품</h2>
            <button
              onClick={() => setSearchOpen((o) => !o)}
              aria-label={searchOpen ? "검색 닫기" : "상품 검색"}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                searchOpen
                  ? "bg-rose-100 text-rose-500"
                  : "text-gray-500 hover:bg-gray-100 hover:text-rose-500"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">찰떡에 등록된 모든 상품을 둘러보세요.</p>

          {searchOpen && (
            <div className="mt-3 relative" ref={searchRef}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="상품명으로 검색..."
                autoFocus
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="검색어 초기화"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
        <ProductSection
          products={products}
          isLoading={isLoadingProducts}
          isError={isErrorProducts}
          query={query}
        />
      </section>
    </div>
  );
}
