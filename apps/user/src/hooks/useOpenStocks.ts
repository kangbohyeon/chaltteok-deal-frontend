import { useQuery } from "@tanstack/react-query";
import { getOpenDailyStocks, type OpenDailyStockResponse } from "@/api/user";

export function useOpenStocks() {
  return useQuery<OpenDailyStockResponse[], Error>({
    queryKey: ["openStocks"],
    queryFn: getOpenDailyStocks,
  });
}
