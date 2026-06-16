"use client";

import Link from "next/link";
import { useCartStore } from "@chaltteok/shared-store";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="mb-4 text-4xl">🛒</p>
        <h2 className="mb-2 text-xl font-bold text-gray-900">장바구니가 비어있습니다</h2>
        <p className="mb-8 text-sm text-gray-500">마음에 드는 상품을 담아보세요.</p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
        >
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">장바구니</h1>
        <button
          onClick={clearCart}
          className="text-sm text-gray-400 transition-colors hover:text-red-500"
        >
          전체 삭제
        </button>
      </div>

      <ul className="mb-8 space-y-4">
        {items.map((item) => (
          <li
            key={item.productUuid}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={item.name}
                className="h-16 w-16 shrink-0 rounded-xl bg-gray-100 object-cover"
              />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded-xl bg-gray-100" />
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-500">{item.price.toLocaleString()}원</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productUuid, item.quantity - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-sm font-bold text-gray-600 transition-colors hover:border-rose-400 hover:text-rose-500"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold text-gray-900">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.productUuid, item.quantity + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-sm font-bold text-gray-600 transition-colors hover:border-rose-400 hover:text-rose-500"
              >
                +
              </button>
            </div>

            <p className="w-24 shrink-0 text-right text-sm font-bold text-gray-900">
              {(item.price * item.quantity).toLocaleString()}원
            </p>

            <button
              onClick={() => removeItem(item.productUuid)}
              className="shrink-0 text-lg text-gray-300 transition-colors hover:text-red-400"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>상품 합계</span>
          <span>{totalPrice().toLocaleString()}원</span>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 font-bold text-gray-900">
          <span>총 결제 금액</span>
          <span className="text-xl text-rose-500">{totalPrice().toLocaleString()}원</span>
        </div>
        <Link
          href="/checkout"
          className="block w-full rounded-lg bg-rose-500 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-rose-600"
        >
          결제하기
        </Link>
      </div>
    </div>
  );
}
