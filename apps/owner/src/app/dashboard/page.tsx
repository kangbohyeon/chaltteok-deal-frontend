"use client";

import { useEffect, useState } from "react";
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

function formatKRW(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

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

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function BarChart({
  items,
  colorClass,
  getLabel,
  getValueLabel,
}: {
  items: { key: string | number; value: number }[];
  colorClass: string;
  getLabel: (k: string | number) => string;
  getValueLabel: (v: number) => string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {items.map((item) => (
        <div key={item.key} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-[10px] text-gray-400 truncate w-full text-center hidden sm:block">
            {getValueLabel(item.value)}
          </span>
          <div
            className={`w-full rounded-t ${colorClass}`}
            style={{ height: `${Math.max((item.value / max) * 100, 2)}%` }}
          />
          <span className="text-[10px] text-gray-500 truncate w-full text-center">
            {getLabel(item.key)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("DAILY");
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [trend, setTrend] = useState<SalesTrendItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [hourlySales, setHourlySales] = useState<HourlySalesItem[]>([]);
  const [fetchedPeriod, setFetchedPeriod] = useState<DashboardPeriod | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loading = fetchedPeriod !== period;

  useEffect(() => {
    const today = toISODate(new Date());
    const { from, to } = getPeriodRange(period);

    Promise.all([
      getDashboardOverview(period),
      getSalesTrend(from, to),
      getTopProducts(from, to),
      getHourlySales(today),
    ])
      .then(([ov, tr, tp, hs]) => {
        setOverview(ov);
        setTrend(tr.trend);
        setTopProducts(tp.products);
        setHourlySales(hs.hourlySales);
        setError(null);
        setFetchedPeriod(period);
      })
      .catch(() => {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        setFetchedPeriod(period);
      });
  }, [period]);

  const periodLabels: Record<DashboardPeriod, string> = {
    DAILY: "오늘",
    WEEKLY: "최근 7일",
    MONTHLY: "이번 달",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">매출 대시보드</h1>
        <div className="flex gap-2">
          {(["DAILY", "WEEKLY", "MONTHLY"] as DashboardPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === p
                  ? "bg-rose-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-rose-300"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      ) : (
        <>
          {/* KPI 카드 */}
          {overview && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 mb-3">
                실시간 매출 현황 · {periodLabels[period]}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <KpiCard label="총 매출" value={formatKRW(overview.totalRevenue)} />
                <KpiCard label="주문 건수" value={`${overview.orderCount.toLocaleString()}건`} />
                <KpiCard label="객단가" value={formatKRW(overview.avgOrderValue)} />
                <KpiCard label="신규 고객" value={`${overview.newCustomers.toLocaleString()}명`} />
                <KpiCard
                  label="재주문 고객"
                  value={`${overview.repeatCustomers.toLocaleString()}명`}
                />
                <KpiCard
                  label="취소/환불"
                  value={`${overview.cancelledCount.toLocaleString()}건`}
                />
              </div>
            </section>
          )}

          {/* 매출 추이 */}
          <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              매출 추이{" "}
              <span className="text-gray-400 font-normal text-xs">({periodLabels[period]})</span>
            </h2>
            {trend.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">데이터 없음</p>
            ) : (
              <BarChart
                items={trend.map((t) => ({ key: t.date, value: t.revenue }))}
                colorClass="bg-rose-400"
                getLabel={(k) => String(k).slice(5)}
                getValueLabel={(v) => formatKRW(v)}
              />
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 인기 메뉴 */}
            <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">인기 메뉴 TOP 10</h2>
              {topProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">데이터 없음</p>
              ) : (
                <div className="space-y-2">
                  {topProducts.map((p, idx) => {
                    const maxQty = topProducts[0].totalQty;
                    const pct = maxQty > 0 ? (p.totalQty / maxQty) * 100 : 0;
                    return (
                      <div key={p.productUuid} className="flex items-center gap-3">
                        <span className="w-5 text-xs font-semibold text-gray-400 text-right shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-sm text-gray-800 truncate">
                              {p.productName}
                            </span>
                            <span className="text-xs text-gray-500 ml-2 shrink-0">
                              {p.totalQty.toLocaleString()}개
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-rose-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 w-20 text-right">
                          {formatKRW(p.totalRevenue)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 시간대별 판매량 */}
            <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                시간대별 판매량{" "}
                <span className="text-gray-400 font-normal text-xs">(오늘)</span>
              </h2>
              {hourlySales.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">데이터 없음</p>
              ) : (
                <BarChart
                  items={hourlySales.map((h) => ({ key: h.hour, value: h.orderCount }))}
                  colorClass="bg-amber-400"
                  getLabel={(k) => `${k}시`}
                  getValueLabel={(v) => `${v}건`}
                />
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
