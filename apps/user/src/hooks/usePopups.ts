import { useQuery } from "@tanstack/react-query";
import { getPopups, type PopupResponse } from "@/api/user";

const STALE_TIME = 60 * 1000;

export function usePopups() {
  return useQuery<PopupResponse[], Error>({
    queryKey: ["popups"],
    queryFn: getPopups,
    staleTime: STALE_TIME,
    select: (data) => data.filter((p) => p.location === "POPUP" || p.location === null),
  });
}
