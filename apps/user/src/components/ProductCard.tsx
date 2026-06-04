"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@chaltteok/shared-store";
import { type ProductResponse } from "@/api/user";

interface ProductCardProps {
  product: ProductResponse;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.soldOut) return;
    addItem({
      productUuid: product.productUuid,
      name: product.name,
      price: product.price,
      thumbnailUrl: product.thumbnailUrl,
    });
  };

  const cardContent = (
    <div
      aria-disabled={product.soldOut}
      className={`flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all ${
        product.soldOut
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:border-rose-200 hover:shadow-md"
      }`}
    >
      <div className="relative h-40 w-full overflow-hidden rounded-xl">
        {product.thumbnailUrl && (
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            unoptimized
            className={`object-cover ${product.soldOut ? "grayscale" : ""}`}
          />
        )}
        {product.soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-sm font-bold tracking-wide text-white">품절</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg leading-tight font-semibold text-gray-900">{product.name}</h3>
        {product.recommended && !product.soldOut && (
          <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">
            추천
          </span>
        )}
        {product.soldOut && (
          <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-500">
            품절
          </span>
        )}
      </div>

      {product.description && (
        <p className="line-clamp-2 text-sm text-gray-500">{product.description}</p>
      )}

      {/* {product.averageRating !== null && product.averageRating !== undefined && (

      )} */}
      <div className="flex items-center gap-1">
        <span className="text-sm text-yellow-400">★</span>
        <span className="text-sm font-medium text-gray-700">
          {product.averageRating !== null && product.averageRating !== undefined
            ? product.averageRating.toFixed(1)
            : 0}
        </span>
        <span className="text-xs text-gray-400">({product.commentCount})</span>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <p className="text-xl font-bold text-gray-900">
          {product.price.toLocaleString()}
          <span className="text-sm font-normal text-gray-500">원</span>
        </p>
        <button
          onClick={handleAddToCart}
          disabled={product.soldOut}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors ${
            product.soldOut ? "cursor-not-allowed bg-gray-300" : "bg-rose-500 hover:bg-rose-600"
          }`}
        >
          {product.soldOut ? "품절" : "담기"}
        </button>
      </div>
    </div>
  );

  if (product.soldOut) {
    return cardContent;
  }

  return (
    <Link href={`/products/${product.productUuid}`} className="block">
      {cardContent}
    </Link>
  );
}
