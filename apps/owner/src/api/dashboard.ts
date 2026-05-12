import api from "@chaltteok/shared-api";

export type DashboardPeriod = "DAILY" | "WEEKLY" | "MONTHLY";

export interface DashboardOverview {
  period: string;
  from: string;
  to: string;
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  newCustomers: number;
  repeatCustomers: number;
  cancelledCount: number;
}

export interface SalesTrendItem {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface SalesTrendResponse {
  trend: SalesTrendItem[];
}

export interface TopProductItem {
  productUuid: string;
  productName: string;
  totalQty: number;
  totalRevenue: number;
}

export interface TopProductsResponse {
  products: TopProductItem[];
}

export interface HourlySalesItem {
  hour: number;
  orderCount: number;
  revenue: number;
}

export interface HourlySalesResponse {
  date: string;
  hourlySales: HourlySalesItem[];
}

export async function getDashboardOverview(period: DashboardPeriod): Promise<DashboardOverview> {
  const res = await api.get<{ data: DashboardOverview }>("/api/v1/owner/dashboard/overview", {
    params: { period },
  });
  return res.data.data;
}

export async function getSalesTrend(from: string, to: string): Promise<SalesTrendResponse> {
  const res = await api.get<{ data: SalesTrendResponse }>("/api/v1/owner/dashboard/sales-trend", {
    params: { from, to },
  });
  return res.data.data;
}

export async function getTopProducts(
  from: string,
  to: string,
  limit = 10,
): Promise<TopProductsResponse> {
  const res = await api.get<{ data: TopProductsResponse }>(
    "/api/v1/owner/dashboard/top-products",
    { params: { from, to, limit } },
  );
  return res.data.data;
}

export async function getHourlySales(date: string): Promise<HourlySalesResponse> {
  const res = await api.get<{ data: HourlySalesResponse }>(
    "/api/v1/owner/dashboard/hourly-sales",
    { params: { date } },
  );
  return res.data.data;
}
