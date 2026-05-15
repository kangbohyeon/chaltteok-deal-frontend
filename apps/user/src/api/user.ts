import api from "@chaltteok/shared-api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  requirePasswordChange: boolean;
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

export interface OrderHistoryItemResponse {
  productName: string;
  quantity: number;
  price: number;
}

export interface PaymentInfoResponse {
  amount: number;
  pgProvider: string | null;
  paymentMethod: string;
  status: string;
  paidAt: string;
}

export interface OrderHistoryResponse {
  orderNumber: string;
  totalPrice: number;
  status: string;
  orderedAt: string;
  items: OrderHistoryItemResponse[];
  payment: PaymentInfoResponse | null;
  canCancel: boolean;
}

export interface OrderHistoryPageResponse {
  content: OrderHistoryResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface OrderHistoryParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  paymentStatus?: string;
}

export async function getOrderHistory(params: OrderHistoryParams = {}): Promise<OrderHistoryPageResponse> {
  const { page = 0, size = 10, keyword, status, fromDate, toDate, paymentStatus } = params;
  const res = await api.get<{ data: OrderHistoryPageResponse }>("/api/v1/user/orders", {
    params: {
      page,
      size,
      ...(keyword ? { keyword } : {}),
      ...(status ? { status } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
    },
  });
  return res.data.data;
}

export async function getOrderDetail(orderNumber: string): Promise<OrderHistoryResponse> {
  const res = await api.get<{ data: OrderHistoryResponse }>(`/api/v1/user/orders/${orderNumber}`);
  return res.data.data;
}

export async function cancelOrder(orderNumber: string): Promise<void> {
  await api.post(`/api/v1/user/orders/${orderNumber}/cancel`);
}

export interface UserProfileResponse {
  email: string;
  nickname: string;
}

export interface UpdateNicknameRequest {
  nickname: string;
}

export async function getMyProfile(): Promise<UserProfileResponse> {
  const res = await api.get<{ data: UserProfileResponse }>("/api/v1/user/me");
  return res.data.data;
}

export async function updateMyProfile(body: UpdateNicknameRequest): Promise<UserProfileResponse> {
  const res = await api.patch<{ data: UserProfileResponse }>("/api/v1/user/me", body);
  return res.data.data;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
}

export async function changePassword(body: ChangePasswordRequest): Promise<void> {
  await api.patch("/api/v1/user/me/password", body);
}

export interface PopupResponse {
  popupUuid: string;
  title: string;
  content: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
}

export async function getPopups(): Promise<PopupResponse[]> {
  const res = await api.get<{ data: PopupResponse[] }>("/api/v1/user/popups");
  return res.data.data;
}
