import api from "@chaltteok/shared-api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export async function loginUser(body: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<{ data: LoginResponse }>("/api/v1/user/auth/login", body);
  return res.data.data;
}

export async function registerUser(body: RegisterRequest): Promise<void> {
  await api.post("/api/v1/user/auth/register", body);
}

export interface OrderRequest {
  dailyStockId: number;
}

export interface OpenDailyStockResponse {
  id: number;
  productName: string;
  price: number;
  saleDate: string;
  remainStock: number;
  totalStock: number;
  maxPurchaseCount: number;
}

export async function placeOrder(body: OrderRequest): Promise<string> {
  const res = await api.post<{ data: string }>("/api/v1/user/orders", body);
  return res.data.data;
}

export async function getOpenDailyStocks(): Promise<OpenDailyStockResponse[]> {
  const res = await api.get<{ data: OpenDailyStockResponse[] }>("/api/v1/user/daily-stocks/open");
  return res.data.data;
}

export interface ProductResponse {
  id: number;
  productUuid: string;
  name: string;
  price: number;
  description: string | null;
  thumbnailUrl: string | null;
  soldOut: boolean;
}

export async function getProducts(): Promise<ProductResponse[]> {
  const res = await api.get<{ data: ProductResponse[] }>("/api/v1/user/products");
  return res.data.data;
}

export async function getRecommendedProducts(): Promise<ProductResponse[]> {
  const res = await api.get<{ data: ProductResponse[] }>("/api/v1/user/products/recommended");
  return res.data.data;
}

export interface CheckoutItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface CheckoutRequest {
  items: CheckoutItem[];
  totalAmount: number;
  paymentMethod: string;
}

export interface CheckoutResponse {
  orderId: number;
  totalAmount: number;
  status: string;
}

export async function checkout(body: CheckoutRequest): Promise<CheckoutResponse> {
  const res = await api.post<{ data: CheckoutResponse }>("/api/v1/user/checkout", body);
  return res.data.data;
}

export async function getParticipatedStockIds(): Promise<number[]> {
  const res = await api.get<{ data: number[] }>("/api/v1/user/daily-stocks/participated");
  return res.data.data;
}
