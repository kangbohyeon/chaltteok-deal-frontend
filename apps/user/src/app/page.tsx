"use client";

import { useOpenStocks } from "@/hooks/useOpenStocks";
import { useProducts } from "@/hooks/useProducts";
import { useRecommendedProducts } from "@/hooks/useRecommendedProducts";
import { useParticipatedStocks } from "@/hooks/useParticipatedStocks";
import EventStockSection from "@/components/EventStockSection";
import ProductSection from "@/components/ProductSection";
import RecommendedSection from "@/components/RecommendedSection";

export default function Home() {
  const {
    data: stocks,
    isLoading: isLoadingStocks,
    isError: isErrorStocks,
  } = useOpenStocks();

  const { data: participatedIds = [] } = useParticipatedStocks();

  const {
    data: recommended,
    isLoading: isLoadingRecommended,
    isError: isErrorRecommended,
  } = useRecommendedProducts();

  const {
    data: products,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
  } = useProducts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 space-y-16">
      {stocks?.length!==0&&(<section>
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
      </section>)}

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
          <h2 className="text-2xl font-bold text-gray-900">일반 상품</h2>
          <p className="mt-1 text-sm text-gray-500">찰떡에 등록된 모든 상품을 둘러보세요.</p>
        </div>
        <ProductSection
          products={products}
          isLoading={isLoadingProducts}
          isError={isErrorProducts}
        />
      </section>
    </div>
  );
}
