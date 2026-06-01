import { useQuery } from "@tanstack/react-query";
import { getPopups, type PopupResponse } from "@/api/user";

export function usePopups() {
  return useQuery<PopupResponse[], Error>({
    queryKey: ["popups"],
    queryFn: getPopups,
    enabled: true,
    staleTime: 60 * 1000,
  });
}
