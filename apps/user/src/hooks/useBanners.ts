import { useQuery } from "@tanstack/react-query";
import { getBanners, type BannerResponse } from "@/api/user";

const STALE_TIME = 60 * 1000;

export function useBanners() {
  return useQuery<BannerResponse[], Error>({
    queryKey: ["banners"],
    queryFn: getBanners,
    staleTime: STALE_TIME,
  });
}
