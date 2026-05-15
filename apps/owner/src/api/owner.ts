import api from "@chaltteok/shared-api";

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  requirePasswordChange: boolean;
}

export async function loginOwner(body: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<{ data: LoginResponse }>("/api/v1/owner/auth/login", body);
  return res.data.data;
}

// ── Product ───────────────────────────────────────────────────────────────────

export interface ProductRegisterRequest {
  name: string;
  price: number;
  descp?: string;
  isActive?: boolean;
  isSoldOut?: boolean;
  isRecommended?: boolean;
}

export interface ProductUpdateRequest {
  name: string;
  price: number;
  descp?: string;
  isActive?: boolean;
  isSoldOut?: boolean;
  isRecommended?: boolean;
}

export interface ProductListResponse {
  id: number;
  uuid: string;
  optionUuid: string;
  name: string;
  price: number;
  descp: string | null;
  imageUrl: string | null;
  active: boolean;
  soldOut: boolean;
  recommended: boolean;
}

export async function getProducts(): Promise<ProductListResponse[]> {
  const res = await api.get<{ data: ProductListResponse[] }>("/api/v1/owner/products");
  return res.data.data;
}

export async function registerProduct(body: ProductRegisterRequest, image?: File): Promise<void> {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(body)], { type: "application/json" }));
  if (image) formData.append("image", image);
  await api.post("/api/v1/owner/products", formData, {
    headers: { "Content-Type": undefined },
  });
}

export async function updateProduct(
  productUuid: string,
  body: ProductUpdateRequest,
  image?: File
): Promise<void> {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(body)], { type: "application/json" }));
  if (image) formData.append("image", image);
  await api.put(`/api/v1/owner/products/${productUuid}`, formData, {
    headers: { "Content-Type": undefined },
  });
}

export async function deleteProduct(productUuid: string): Promise<void> {
  await api.delete(`/api/v1/owner/products/${productUuid}`);
}

export async function toggleActive(productUuid: string): Promise<void> {
  await api.patch(`/api/v1/owner/products/${productUuid}/active`);
}

export async function toggleSoldOut(productUuid: string): Promise<void> {
  await api.patch(`/api/v1/owner/products/${productUuid}/soldout`);
}

export async function toggleRecommend(productUuid: string): Promise<void> {
  await api.patch(`/api/v1/owner/products/${productUuid}/recommend`);
}

// ── Password Change ───────────────────────────────────────────────────────────

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
}

export async function changeOwnerPassword(body: ChangePasswordRequest): Promise<void> {
  await api.patch("/api/v1/owner/me/password", body);
}

// ── Popup ─────────────────────────────────────────────────────────────────────

export interface PopupRequest {
  title: string;
  content: string;
  isVisible: boolean;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface PopupResponse {
  popupUuid: string;
  title: string;
  content: string;
  isVisible: boolean;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export async function getPopups(): Promise<PopupResponse[]> {
  const res = await api.get<{ data: PopupResponse[] }>("/api/v1/owner/popups");
  return res.data.data;
}

export async function createPopup(body: PopupRequest): Promise<void> {
  await api.post("/api/v1/owner/popups", body);
}

export async function updatePopup(uuid: string, body: PopupRequest): Promise<void> {
  await api.put(`/api/v1/owner/popups/${uuid}`, body);
}

export async function deletePopup(uuid: string): Promise<void> {
  await api.delete(`/api/v1/owner/popups/${uuid}`);
}

// ── Daily Stock ───────────────────────────────────────────────────────────────

export interface DailyStockRegisterRequest {
  optionId: string;
  saleDate: string;
  stockType?: "NORMAL" | "EVENT";
  salePrice?: number;
  totalQty: number;
}

export interface DailyStockListResponse {
  id: number;
  uuid: string;
  productUuid: string;
  productName: string;
  optionUuid: string;
  saleDate: string;
  stockType: string;
  salePrice: number;
  totalQty: number;
  remainStock: number;
  status: string;
}

export async function getDailyStocks(): Promise<DailyStockListResponse[]> {
  const res = await api.get<{ data: DailyStockListResponse[] }>("/api/v1/owner/daily-stocks");
  return res.data.data;
}

export async function registerDailyStock(body: DailyStockRegisterRequest): Promise<void> {
  await api.post("/api/v1/owner/daily-stocks", body);
}

export async function updateDailyStock(
  stockUuid: string,
  body: DailyStockRegisterRequest
): Promise<void> {
  await api.put(`/api/v1/owner/daily-stocks/${stockUuid}`, body);
}

export async function deleteDailyStock(stockUuid: string): Promise<void> {
  await api.delete(`/api/v1/owner/daily-stocks/${stockUuid}`);
}
