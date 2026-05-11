"use client";

import Link from "next/link";
import { useCartStore } from "@chaltteok/shared-store";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">장바구니가 비어있습니다</h2>
        <p className="text-sm text-gray-500 mb-8">마음에 드는 상품을 담아보세요.</p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
        >
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">장바구니</h1>
        <button
          onClick={clearCart}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          전체 삭제
        </button>
      </div>

      <ul className="space-y-4 mb-8">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{item.name}</p>
              <p className="text-sm text-gray-500">{item.price.toLocaleString()}원</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:border-rose-400 hover:text-rose-500 flex items-center justify-center text-sm font-bold transition-colors"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold text-gray-900">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:border-rose-400 hover:text-rose-500 flex items-center justify-center text-sm font-bold transition-colors"
              >
                +
              </button>
            </div>

            <p className="w-24 text-right text-sm font-bold text-gray-900 shrink-0">
              {(item.price * item.quantity).toLocaleString()}원
            </p>

            <button
              onClick={() => removeItem(item.productId)}
              className="text-gray-300 hover:text-red-400 transition-colors text-lg shrink-0"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>상품 합계</span>
          <span>{totalPrice().toLocaleString()}원</span>
        </div>
        <div className="border-t border-gray-100 pt-4 flex justify-between items-center font-bold text-gray-900">
          <span>총 결제 금액</span>
          <span className="text-xl text-rose-500">{totalPrice().toLocaleString()}원</span>
        </div>
        <Link
          href="/checkout"
          className="block w-full rounded-lg bg-rose-500 py-3 text-center text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
        >
          결제하기
        </Link>
      </div>
    </div>
  );
}
