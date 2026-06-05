import { useCallback, useEffect, useState } from "react";
import {
  getDashboardOverview,
  getSalesTrend,
  getTopProducts,
  getHourlySales,
  type DashboardPeriod,
  type DashboardOverview,
  type SalesTrendItem,
  type TopProductItem,
  type HourlySalesItem,
} from "@/api/dashboard";

export type PeriodMode = DashboardPeriod | "CUSTOM";

function toISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getPeriodRange(period: DashboardPeriod): { from: string; to: string } {
  const today = new Date();
  const to = toISODate(today);
  if (period === "DAILY") return { from: to, to };
  if (period === "WEEKLY") {
    const from = new Date(today);
    from.setDate(today.getDate() - 6);
    return { from: toISODate(from), to };
  }
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  return { from: toISODate(from), to };
}

interface DashboardData {
  overview: DashboardOverview | null;
  trend: SalesTrendItem[];
  topProducts: TopProductItem[];
  hourlySales: HourlySalesItem[];
  loading: boolean;
  error: string | null;
}

interface CustomRange {
  from: string;
  to: string;
}

export function useDashboard() {
  const [periodMode, setPeriodMode] = useState<PeriodMode>("DAILY");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [appliedRange, setAppliedRange] = useState<CustomRange | null>(null);
  const [data, setData] = useState<DashboardData>({
    overview: null,
    trend: [],
    topProducts: [],
    hourlySales: [],
    loading: true,
    error: null,
  });

  const applyCustomRange = useCallback(() => {
    if (customFrom && customTo) {
      setAppliedRange({ from: customFrom, to: customTo });
    }
  }, [customFrom, customTo]);

  useEffect(() => {
    const isCustom = periodMode === "CUSTOM";

    let from: string;
    let to: string;

    if (isCustom) {
      if (!appliedRange) return;
      from = appliedRange.from;
      to = appliedRange.to;
    } else {
      const range = getPeriodRange(periodMode as DashboardPeriod);
      from = range.from;
      to = range.to;
    }

    const today = toISODate(new Date());
    let cancelled = false;

    const load = async () => {
      setData((prev) => ({ ...prev, loading: true, error: null }));
      const results = await Promise.allSettled([
        getDashboardOverview(
          isCustom ? "DAILY" : (periodMode as DashboardPeriod),
          isCustom ? from : undefined,
          isCustom ? to : undefined
        ),
        getSalesTrend(from, to),
        getTopProducts(from, to),
        getHourlySales(isCustom ? to : today),
      ]);
      if (cancelled) return;
      const [ov, tr, tp, hs] = results;
      setData({
        overview: ov.status === "fulfilled" ? ov.value : null,
        trend: tr.status === "fulfilled" ? tr.value.trend : [],
        topProducts: tp.status === "fulfilled" ? tp.value.products : [],
        hourlySales: hs.status === "fulfilled" ? hs.value.hourlySales : [],
        loading: false,
        error: results.some((r) => r.status === "rejected")
          ? "일부 데이터를 불러오지 못했습니다."
          : null,
      });
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [periodMode, appliedRange]);

  return {
    periodMode,
    setPeriodMode,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    appliedRange,
    applyCustomRange,
    ...data,
  };
}

export { getPeriodRange, toISODate };
