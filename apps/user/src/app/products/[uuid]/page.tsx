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
  const clearCart = useCartStore((s) => s.clearCart);
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
        productUuid: product.productUuid,
        name: product.name,
        price: product.price,
        thumbnailUrl: product.thumbnailUrl,
      });
    }
  };

  const handleBuyNow = () => {
    if (!product || product.soldOut) return;
    clearCart();
    for (let i = 0; i < qty; i++) {
      addItem({
        productUuid: product.productUuid,
        name: product.name,
        price: product.price,
        thumbnailUrl: product.thumbnailUrl,
      });
    }
    router.push("/checkout");
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
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-gray-400">불러오는 중...</div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="mb-4 text-gray-500">상품 정보를 불러오지 못했습니다.</p>
        <button onClick={() => router.back()} className="text-sm text-rose-500 hover:underline">
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-rose-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        목록으로
      </button>

      {/* 상품 기본 정보 */}
      <div className="flex flex-col gap-8 sm:flex-row">
        {/* 이미지 */}
        <div className="relative h-64 w-full shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:w-64">
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl text-gray-300">
              🛍
            </div>
          )}
          {product.soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-lg font-bold tracking-wide text-white">품절</span>
            </div>
          )}
        </div>

        {/* 정보 + 구매 */}
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              {product.soldOut && (
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-500">
                  품절
                </span>
              )}
            </div>

            {product.averageRating != null && (
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`text-base leading-none ${product.averageRating! >= s ? "text-amber-400" : "text-gray-200"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <p className="text-2xl font-bold text-gray-900">
            {product.price.toLocaleString()}
            <span className="ml-1 text-base font-normal text-gray-500">원</span>
          </p>

          {/* 수량 선택 */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">수량</span>
            <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={product.soldOut}
                className="px-3 py-1.5 text-lg leading-none text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-10 border-x border-gray-300 px-4 py-1.5 text-center text-sm font-semibold text-gray-900">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                disabled={product.soldOut}
                className="px-3 py-1.5 text-lg leading-none text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-1">
            <span className="text-sm text-gray-500">총 금액</span>
            <span className="text-xl font-bold text-rose-500">
              {(product.price * qty).toLocaleString()}
              <span className="ml-1 text-sm font-normal text-gray-500">원</span>
            </span>
          </div>

          {product.soldOut ? (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-xl bg-gray-300 py-3 text-sm font-bold text-white"
            >
              품절된 상품입니다
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 rounded-xl border border-rose-500 py-3 text-sm font-bold text-rose-500 transition-colors hover:bg-rose-50 active:bg-rose-100"
              >
                장바구니 담기
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-600 active:bg-rose-700"
              >
                바로구매
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 탭 영역 */}
      <div>
        <div className="flex border-b border-gray-200">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
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
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                  {product.description}
                </p>
              ) : (
                <p className="py-12 text-center text-sm text-gray-400">
                  등록된 상품 설명이 없습니다.
                </p>
              )}
            </div>
          )}

          {tab === "reviews" && (
            <CommentSection
              productUuid={product.productUuid}
              commentCount={product.commentCount}
              defaultOpen
            />
          )}

          {tab === "inquiry" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                상품에 대한 궁금한 점을 문의해 주세요. 점주가 직접 답변드립니다.
              </p>
              {role === "ROLE_USER" ? (
                inquirySuccess ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-green-700">문의가 등록되었습니다.</p>
                    <p className="mt-1 text-xs text-green-600">
                      마이페이지 &gt; 1:1 문의에서 답변을 확인하실 수 있습니다.
                    </p>
                    <button
                      onClick={() => setInquirySuccess(false)}
                      className="mt-3 text-xs text-gray-500 underline hover:text-gray-700"
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
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                    />
                    <textarea
                      value={inquiryContent}
                      onChange={(e) => setInquiryContent(e.target.value)}
                      placeholder="문의 내용을 입력하세요"
                      required
                      rows={5}
                      className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                    />
                    {inquiryError && <p className="text-sm text-red-500">{inquiryError}</p>}
                    <button
                      type="submit"
                      disabled={inquirySaving || !inquiryTitle.trim() || !inquiryContent.trim()}
                      className="rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
                    >
                      {inquirySaving ? "등록 중..." : "문의 등록"}
                    </button>
                  </form>
                )
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center">
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
