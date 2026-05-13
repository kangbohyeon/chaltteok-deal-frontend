"use client";

import { useCartStore } from "@chaltteok/shared-store";
import { type ProductResponse } from "@/api/user";

interface ProductCardProps {
  product: ProductResponse;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col gap-3">
      {product.thumbnailUrl && (
        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.soldOut && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-sm font-bold tracking-wide">품절</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">{product.name}</h3>
        {product.soldOut && (
          <span className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-500">
            품절
          </span>
        )}
      </div>

      {product.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto">
        <p className="text-xl font-bold text-gray-900">
          {product.price.toLocaleString()}
          <span className="text-sm font-normal text-gray-500">원</span>
        </p>
        <button
          onClick={handleAddToCart}
          disabled={product.soldOut}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors ${
            product.soldOut
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-rose-500 hover:bg-rose-600"
          }`}
        >
          {product.soldOut ? "품절" : "담기"}
        </button>
      </div>
    </div>
  );
}
