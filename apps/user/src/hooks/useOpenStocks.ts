import { useQuery } from "@tanstack/react-query";
import { getOpenTimeSaleStocks, type OpenTimeSaleStockResponse } from "@/api/user";

export function useOpenStocks() {
  return useQuery<OpenTimeSaleStockResponse[], Error>({
    queryKey: ["openStocks"],
    queryFn: getOpenTimeSaleStocks,
  });
}
