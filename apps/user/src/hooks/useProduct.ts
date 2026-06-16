import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/api/user";

export function useProduct(productUuid: string) {
  return useQuery({
    queryKey: ["product", productUuid],
    queryFn: () => getProduct(productUuid),
    enabled: !!productUuid,
  });
}
