import { useQuery } from "@tanstack/react-query";
import { getRecommendedProducts, type ProductResponse } from "@/api/user";

export function useRecommendedProducts() {
  return useQuery<ProductResponse[], Error>({
    queryKey: ["recommendedProducts"],
    queryFn: getRecommendedProducts,
  });
}
