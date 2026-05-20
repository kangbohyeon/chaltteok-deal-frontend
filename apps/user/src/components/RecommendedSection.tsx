"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCartStore } from "@chaltteok/shared-store";
import { type ProductResponse } from "@/api/user";

const SLIDE_INTERVAL_MS = 3500;
const FADE_DURATION_MS = 200;

interface Props {
  products: ProductResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export default function RecommendedSection({ products, isLoading, isError }: Props) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);
  const currentRef = useRef(0);
  const addItem = useCartStore((s) => s.addItem);

  const total = products?.length ?? 0;

  const goTo = useCallback((index: number) => {
    setFading(true);
    setTimeout(() => {
      currentRef.current = index;
      setCurrent(index);
      setFading(false);
    }, FADE_DURATION_MS);
  }, []);

  useEffect(() => {
    if (paused || total <= 1) return;
    const timer = setInterval(() => {
      goTo((currentRef.current + 1) % total);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, goTo, total]);

  if (isLoading) {
    return <div className="h-52 rounded-2xl bg-gray-100 animate-pulse" />;
  }

  if (isError) {
    return <p className="text-sm text-red-500">추천 상품을 불러오지 못했습니다.</p>;
  }

  if (!products || total === 0) {
    return <p className="text-sm text-gray-400">현재 추천 상품이 없습니다.</p>;
  }

  const product = products[current];

  const handleAddToCart = () => {
    if (product.soldOut) return;
    addItem({
      productId: product.id,
      productUuid: product.productUuid,
      name: product.name,
      price: product.price,
      thumbnailUrl: product.thumbnailUrl,
    });
  };

  return (
    <div
      className="relative rounded-2xl border border-amber-100 bg-linear-to-br from-amber-50 to-white overflow-hidden shadow-sm select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 슬라이드 본문 */}
      <div
        className={`flex items-center gap-5 px-10 py-6 min-h-49 transition-opacity duration-200 ${
          fading ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* 상품 이미지 */}
        <div className="relative w-36 h-36 rounded-xl overflow-hidden shrink-0 bg-gray-100 shadow-sm">
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
              🛍
            </div>
          )}
          {product.soldOut && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-wide">품절</span>
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 rounded-full px-2.5 py-0.5">
              점주 추천
            </span>
            {product.soldOut && (
              <span className="text-xs font-medium text-red-500 bg-red-50 rounded-full px-2.5 py-0.5">
                품절
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 leading-snug line-clamp-1">
            {product.name}
          </h3>

          {product.averageRating != null && (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={`text-sm leading-none ${product.averageRating! >= s ? "text-amber-400" : "text-gray-200"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {product.averageRating.toFixed(1)}
                {product.commentCount > 0 && (
                  <span className="ml-1 text-gray-400">({product.commentCount})</span>
                )}
              </span>
            </div>
          )}

          {product.description && (
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <p className="text-2xl font-bold text-gray-900">
              {product.price.toLocaleString()}
              <span className="text-sm font-normal text-gray-400 ml-0.5">원</span>
            </p>
            <button
              onClick={handleAddToCart}
              disabled={product.soldOut}
              className={`rounded-xl px-5 py-2 text-sm font-semibold text-white transition-colors ${
                product.soldOut
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-rose-500 hover:bg-rose-600 active:bg-rose-700"
              }`}
            >
              {product.soldOut ? "품절" : "장바구니 담기"}
            </button>
          </div>
        </div>
      </div>

      {/* 이전 / 다음 화살표 */}
      {total > 1 && (
        <>
          <button
            onClick={() => goTo((currentRef.current - 1 + total) % total)}
            aria-label="이전 추천 상품"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 text-lg hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 shadow-sm transition-all"
          >
            ‹
          </button>
          <button
            onClick={() => goTo((currentRef.current + 1) % total)}
            aria-label="다음 추천 상품"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 text-lg hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 shadow-sm transition-all"
          >
            ›
          </button>
        </>
      )}

      {/* 하단 도트 인디케이터 */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`${i + 1}번째 추천 상품`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-5 h-2 bg-amber-500"
                  : "w-2 h-2 bg-gray-300 hover:bg-amber-300"
              }`}
            />
          ))}
        </div>
      )}

    </div>
  );
}
