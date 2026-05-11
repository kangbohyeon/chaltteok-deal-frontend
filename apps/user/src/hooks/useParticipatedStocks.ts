import { useQuery } from "@tanstack/react-query";
import { getParticipatedStockIds } from "@/api/user";
import { useAuthStore } from "@chaltteok/shared-store";

export function useParticipatedStocks() {
  const role = useAuthStore((s) => s.role);
  return useQuery<number[], Error>({
    queryKey: ["participatedStocks"],
    queryFn: getParticipatedStockIds,
    enabled: role === "ROLE_USER",
    staleTime: 30 * 1000,
  });
}
