import { useQuery } from "@tanstack/react-query";
import { getParticipationCounts } from "@/api/user";
import { useAuthStore } from "@chaltteok/shared-store";

export function useParticipatedStocks() {
  const role = useAuthStore((s) => s.role);
  return useQuery<Record<string, number>, Error>({
    queryKey: ["participatedStocks", role],
    queryFn: getParticipationCounts,
    enabled: role === "ROLE_USER",
    staleTime: 30 * 1000,
  });
}
