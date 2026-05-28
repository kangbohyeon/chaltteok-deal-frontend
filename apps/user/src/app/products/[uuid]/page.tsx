"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useProduct } from "@/hooks/useProduct";
import { useCartStore, useAuthStore } from "@chaltteok/shared-store";
import { createInquiry } from "@/api/user";
import CommentSection from "@/components/CommentSection";

type Tab = "description" | "reviews" | "inquiry";

const TABS: { key: Tab; label: string }[] = [
  { key: "description", label: "상품 설명" },
  { key: "reviews", label: "구매후기" },
  { key: "inquiry", label: "상품문의" },
];

export default function ProductDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const router = useRouter();
  const { data: product, isLoading, isError } = useProduct(uuid);
  const addItem = useCartStore((s) => s.addItem);
  const role = useAuthStore((s) => s.role);

  const [tab, setTab] = useState<Tab>("description");
  const [qty, setQty] = useState(1);

  const [inquiryTitle, setInquiryTitle] = useState("");
  const [inquiryContent, setInquiryContent] = useState("");
  const [inquirySaving, setInquirySaving] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  const handleAddToCart = () => {
    if (!product || product.soldOut) return;
    for (let i = 0; i < qty; i++) {
      addItem({
        productId: product.id,
        productUuid: product.productUuid,
        name: product.name,
        price: product.price,
        thumbnailUrl: product.thumbnailUrl,
      });
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inquiryTitle.trim() || !inquiryContent.trim()) return;
    setInquirySaving(true);
    setInquiryError(null);
    try {
      await createInquiry({
        title: `[상품 문의] ${product?.name ?? ""} - ${inquiryTitle.trim()}`,
        content: inquiryContent.trim(),
      });
      setInquirySuccess(true);
      setInquiryTitle("");
      setInquiryContent("");
    } catch {
      setInquiryError("문의 등록에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setInquirySaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-gray-400">
        불러오는 중...
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">상품 정보를 불러오지 못했습니다.</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-rose-500 hover:underline"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-rose-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        목록으로
      </button>

      {/* 상품 기본 정보 */}
      <div className="flex flex-col sm:flex-row gap-8">
        {/* 이미지 */}
        <div className="relative w-full sm:w-64 h-64 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
          {product.thumbnailUrl ? (
            <Image src={product.thumbnailUrl} alt={product.name} fill unoptimized className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">🛍</div>
          )}
          {product.soldOut && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-lg font-bold tracking-wide">품절</span>
            </div>
          )}
        </div>

        {/* 정보 + 구매 */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              {product.soldOut && (
                <span className="rounded px-2 py-0.5 text-xs font-medium bg-red-100 text-red-500">품절</span>
              )}
            </div>

            {product.averageRating != null && (
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`text-base leading-none ${product.averageRating! >= s ? "text-amber-400" : "text-gray-200"}`}>★</span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.averageRating.toFixed(1)}
                  {product.commentCount > 0 && <span className="ml-1 text-gray-400">({product.commentCount}개 리뷰)</span>}
                </span>
              </div>
            )}
          </div>

          <p className="text-2xl font-bold text-gray-900">
            {product.price.toLocaleString()}<span className="text-base font-normal text-gray-500 ml-1">원</span>
          </p>

          {/* 수량 선택 */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">수량</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={product.soldOut}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors text-lg leading-none"
              >
                −
              </button>
              <span className="px-4 py-1.5 text-sm font-semibold text-gray-900 border-x border-gray-300 min-w-10 text-center">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                disabled={product.soldOut}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors text-lg leading-none"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <span className="text-sm text-gray-500">총 금액</span>
            <span className="text-xl font-bold text-rose-500">
              {(product.price * qty).toLocaleString()}<span className="text-sm font-normal text-gray-500 ml-1">원</span>
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.soldOut}
            className={`w-full rounded-xl py-3 text-sm font-bold text-white transition-colors ${
              product.soldOut ? "bg-gray-300 cursor-not-allowed" : "bg-rose-500 hover:bg-rose-600 active:bg-rose-700"
            }`}
          >
            {product.soldOut ? "품절된 상품입니다" : "장바구니 담기"}
          </button>
        </div>
      </div>

      {/* 탭 영역 */}
      <div>
        <div className="flex border-b border-gray-200">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                tab === key
                  ? "border-rose-500 text-rose-500"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="pt-6">
          {tab === "description" && (
            <div className="min-h-32">
              {product.description ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              ) : (
                <p className="text-sm text-gray-400 text-center py-12">등록된 상품 설명이 없습니다.</p>
              )}
            </div>
          )}

          {tab === "reviews" && (
            <CommentSection productUuid={product.productUuid} commentCount={product.commentCount} />
          )}

          {tab === "inquiry" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                상품에 대한 궁금한 점을 문의해 주세요. 점주가 직접 답변드립니다.
              </p>
              {role === "ROLE_USER" ? (
                inquirySuccess ? (
                  <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-green-700">문의가 등록되었습니다.</p>
                    <p className="text-xs text-green-600 mt-1">마이페이지 &gt; 1:1 문의에서 답변을 확인하실 수 있습니다.</p>
                    <button
                      onClick={() => setInquirySuccess(false)}
                      className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      추가 문의하기
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-3">
                    <input
                      type="text"
                      value={inquiryTitle}
                      onChange={(e) => setInquiryTitle(e.target.value)}
                      placeholder="문의 제목을 입력하세요"
                      required
                      maxLength={100}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                    <textarea
                      value={inquiryContent}
                      onChange={(e) => setInquiryContent(e.target.value)}
                      placeholder="문의 내용을 입력하세요"
                      required
                      rows={5}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                    />
                    {inquiryError && <p className="text-sm text-red-500">{inquiryError}</p>}
                    <button
                      type="submit"
                      disabled={inquirySaving || !inquiryTitle.trim() || !inquiryContent.trim()}
                      className="rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
                    >
                      {inquirySaving ? "등록 중..." : "문의 등록"}
                    </button>
                  </form>
                )
              ) : (
                <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-8 text-center">
                  <p className="text-sm text-gray-500">로그인 후 문의를 남기실 수 있습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
