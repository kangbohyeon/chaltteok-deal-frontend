"use client";

import { useCartStore } from "@chaltteok/shared-store";
import { type ProductResponse } from "@/api/user";

interface ProductCardProps {
  product: ProductResponse;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
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
        <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 leading-tight">{product.name}</h3>

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
          className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 transition-colors"
        >
          담기
        </button>
      </div>
    </div>
  );
}
