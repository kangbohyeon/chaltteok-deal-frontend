import { type ProductResponse } from "@/api/user";
import ProductCard from "./ProductCard";

interface Props {
  products: ProductResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export default function RecommendedSection({ products, isLoading, isError }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-red-500">추천 상품을 불러오지 못했습니다.</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-sm text-gray-400">현재 추천 상품이 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
