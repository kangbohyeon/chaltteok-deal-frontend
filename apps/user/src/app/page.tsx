"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useOpenStocks } from "@/hooks/useOpenStocks";
import { useProducts } from "@/hooks/useProducts";
import { useBanners } from "@/hooks/useBanners";
import { useParticipatedStocks } from "@/hooks/useParticipatedStocks";
import EventStockSection from "@/components/EventStockSection";
import ProductSection from "@/components/ProductSection";
import RollingBanner from "@/components/RollingBanner";

export default function Home() {
  const { data: stocks, isLoading: isLoadingStocks, isError: isErrorStocks } = useOpenStocks();
  const { data: participationCounts = {} } = useParticipatedStocks();
  const { data: banners, isLoading: isLoadingBanners, isError: isErrorBanners } = useBanners();
  const { data: products, isLoading: isLoadingProducts, isError: isErrorProducts } = useProducts();

  // OPEN + SCHEDULED 타임세일 상품을 일반 목록에서 제외
  const timesaleProductUuids = useMemo(
    () => new Set((stocks ?? []).map((s) => s.productUuid)),
    [stocks]
  );

  // EventStockSection에는 현재 판매 중(OPEN)인 상품만 표시
  const activeStocks = useMemo(() => (stocks ?? []).filter((s) => s.status === "OPEN"), [stocks]);

  const regularProducts = useMemo(
    () => (products ?? []).filter((p) => !timesaleProductUuids.has(p.productUuid)),
    [products, timesaleProductUuids]
  );

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!searchOpen) setQuery("");
  }, [searchOpen]);

  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-16">
      {(isLoadingStocks || activeStocks.length > 0) && (
        <section>
          <div className="mb-6">
            <span className="mb-2 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
              오늘만
            </span>
            <h2 className="text-2xl font-bold text-gray-900">오늘의 이벤트 상품</h2>
            <p className="mt-1 text-sm text-gray-500">매일 한정 수량으로 만나는 특별한 이벤트 딜</p>
          </div>
          <EventStockSection
            stocks={activeStocks}
            isLoading={isLoadingStocks}
            isError={isErrorStocks}
            participationCounts={participationCounts}
          />
        </section>
      )}

      <RollingBanner banners={banners} isLoading={isLoadingBanners} isError={isErrorBanners} />

      <section>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">일반 상품</h2>
            <button
              onClick={() => setSearchOpen((o) => !o)}
              aria-label={searchOpen ? "검색 닫기" : "상품 검색"}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                searchOpen
                  ? "bg-rose-100 text-rose-500"
                  : "text-gray-500 hover:bg-gray-100 hover:text-rose-500"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">찰떡에 등록된 모든 상품을 둘러보세요.</p>

          {searchOpen && (
            <div className="relative mt-3" ref={searchRef}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="상품명으로 검색..."
                autoFocus
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-rose-300 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="검색어 초기화"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-lg leading-none text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
        <ProductSection
          products={regularProducts}
          isLoading={isLoadingProducts}
          isError={isErrorProducts}
          query={query}
        />
      </section>
    </div>
  );
}
