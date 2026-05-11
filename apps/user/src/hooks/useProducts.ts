import { useQuery } from "@tanstack/react-query";
import { getProducts, type ProductResponse } from "@/api/user";

export function useProducts() {
  return useQuery<ProductResponse[], Error>({
    queryKey: ["products"],
    queryFn: getProducts,
  });
}
