"use client";

import { type DashboardPeriod } from "@/api/dashboard";
import { useDashboard, toISODate, getPeriodRange, type PeriodMode } from "@/hooks/useDashboard";

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  DAILY: "오늘",
  WEEKLY: "최근 7일",
  MONTHLY: "이번 달",
};

function formatKRW(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

function getPeriodDisplayLabel(
  mode: PeriodMode,
  applied: { from: string; to: string } | null
): string {
  if (mode === "CUSTOM" && applied) return `${applied.from} ~ ${applied.to}`;
  const { from, to } = getPeriodRange(mode as DashboardPeriod);
  if (from === to) return from;
  return `${from} ~ ${to}`;
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="mb-1 text-xs font-medium text-gray-400">{label}</p>
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
    <div className="flex h-32 items-end gap-1">
      {items.map((item) => (
        <div key={item.key} className="flex flex-1 flex-col items-center gap-1">
          <span className="hidden w-full truncate text-center text-[10px] text-gray-400 sm:block">
            {getValueLabel(item.value)}
          </span>
          <div
            className={`w-full rounded-t ${colorClass}`}
            style={{ height: `${Math.max((item.value / max) * 100, 2)}%` }}
          />
          <span className="w-full truncate text-center text-[10px] text-gray-500">
            {getLabel(item.key)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const {
    periodMode,
    setPeriodMode,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    appliedRange,
    applyCustomRange,
    overview,
    trend,
    topProducts,
    hourlySales,
    loading,
    error,
  } = useDashboard();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* 헤더 */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">매출 대시보드</h1>
            {/* 선택된 기간 표시 */}
            <p className="mt-0.5 text-xs text-gray-400">
              {getPeriodDisplayLabel(periodMode, appliedRange)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["DAILY", "WEEKLY", "MONTHLY"] as DashboardPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriodMode(p);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  periodMode === p
                    ? "bg-rose-500 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-rose-300"
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
            <button
              onClick={() => setPeriodMode("CUSTOM")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                periodMode === "CUSTOM"
                  ? "bg-rose-500 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-rose-300"
              }`}
            >
              직접 설정
            </button>
          </div>
        </div>

        {/* 직접 설정 패널 */}
        {periodMode === "CUSTOM" && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-600">시작일</label>
              <input
                type="date"
                value={customFrom}
                max={customTo || toISODate(new Date())}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-800 focus:ring-2 focus:ring-rose-300 focus:outline-none"
              />
            </div>
            <span className="text-gray-400">~</span>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-600">종료일</label>
              <input
                type="date"
                value={customTo}
                min={customFrom}
                max={toISODate(new Date())}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-800 focus:ring-2 focus:ring-rose-300 focus:outline-none"
              />
            </div>
            <button
              onClick={applyCustomRange}
              disabled={!customFrom || !customTo}
              className="rounded-lg bg-rose-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-40"
            >
              조회
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-gray-400">불러오는 중...</div>
      ) : (
        <>
          {/* KPI 카드 */}
          {overview && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-gray-500">
                실시간 매출 현황 · {getPeriodDisplayLabel(periodMode, appliedRange)}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">
              매출 추이{" "}
              <span className="text-xs font-normal text-gray-400">
                ({getPeriodDisplayLabel(periodMode, appliedRange)})
              </span>
            </h2>
            {trend.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">데이터 없음</p>
            ) : (
              <BarChart
                items={trend.map((t) => ({ key: t.date, value: t.revenue }))}
                colorClass="bg-rose-400"
                getLabel={(k) => String(k).slice(5)}
                getValueLabel={(v) => formatKRW(v)}
              />
            )}
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 인기 메뉴 */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-700">인기 메뉴 TOP 10</h2>
              {topProducts.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">데이터 없음</p>
              ) : (
                <div className="space-y-2">
                  {topProducts.map((p, idx) => {
                    const maxQty = topProducts[0].totalQty;
                    const pct = maxQty > 0 ? (p.totalQty / maxQty) * 100 : 0;
                    return (
                      <div key={p.productUuid} className="flex items-center gap-3">
                        <span className="w-5 shrink-0 text-right text-xs font-semibold text-gray-400">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-center justify-between">
                            <span className="truncate text-sm text-gray-800">{p.productName}</span>
                            <span className="ml-2 shrink-0 text-xs text-gray-500">
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
                        <span className="w-20 shrink-0 text-right text-xs text-gray-400">
                          {formatKRW(p.totalRevenue)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 시간대별 판매량 */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-700">
                시간대별 판매량{" "}
                <span className="text-xs font-normal text-gray-400">
                  ({appliedRange?.to ?? "오늘"})
                </span>
              </h2>
              {hourlySales.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">데이터 없음</p>
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
