import api from "@chaltteok/shared-api";

export interface ProductRegisterRequest {
  name: string;
  price: number;
  description?: string;
}

export interface DailyStockRegisterRequest {
  productId: number;
  saleDate: string;
  totalStock: number;
  maxPurchaseCount: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  price: number;
  description: string;
  thumbnailUrl: string | null;
  isRecommended: boolean;
}

export async function registerProduct(body: ProductRegisterRequest): Promise<number> {
  const res = await api.post<{ data: number }>("/api/v1/owner/products", body);
  return res.data.data;
}

export async function registerDailyStock(body: DailyStockRegisterRequest): Promise<number> {
  const res = await api.post<{ data: number }>("/api/v1/owner/daily-stocks", body);
  return res.data.data;
}

export async function getProducts(): Promise<ProductResponse[]> {
  const res = await api.get<{ data: ProductResponse[] }>("/api/v1/owner/products");
  return res.data.data;
}

export async function toggleRecommend(productId: number): Promise<void> {
  await api.patch(`/api/v1/owner/products/${productId}/recommend`);
}
