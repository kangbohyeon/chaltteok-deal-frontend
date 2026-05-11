import { type ProductResponse } from "@/api/user";
import ProductCard from "./ProductCard";

interface ProductSectionProps {
  products: ProductResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export default function ProductSection({ products, isLoading, isError }: ProductSectionProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-52 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-500">
        상품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  if (!products || products.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-12">
        등록된 상품이 없습니다.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
