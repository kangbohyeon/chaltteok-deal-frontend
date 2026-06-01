import { useQuery } from "@tanstack/react-query";
import { getBanners, type BannerResponse } from "@/api/user";

export function useBanners() {
  return useQuery<BannerResponse[], Error>({
    queryKey: ["banners"],
    queryFn: getBanners,
    enabled: true,
    staleTime: 60 * 1000,
  });
}
