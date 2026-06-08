import api from "@chaltteok/shared-api";

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userUuid: string;
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
  stockQuantity?: number | null;
  displayOrder?: number;
}

export interface ProductUpdateRequest {
  name: string;
  price: number;
  descp?: string;
  isActive?: boolean;
  isSoldOut?: boolean;
  isRecommended?: boolean;
  stockQuantity?: number | null;
  currentStock?: number | null;
  displayOrder?: number;
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
  stockQuantity: number | null;
  currentStock: number | null;
  displayOrder: number;
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
  startTime: string | null;
  endTime: string | null;
}

export interface PopupResponse {
  popupUuid: string;
  title: string;
  content: string;
  isVisible: boolean;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
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

// ── Banner ────────────────────────────────────────────────────────────────────

export interface BannerRequest {
  title: string | null;
  subtitle: string | null;
  linkUrl: string | null;
  backgroundColor: string | null;
  sortOrder: number;
  isVisible: boolean;
  startDate: string | null;
  endDate: string | null;
}

export interface BannerResponse {
  bannerUuid: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  backgroundColor: string | null;
  sortOrder: number;
  isVisible: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export async function getBanners(): Promise<BannerResponse[]> {
  const res = await api.get<{ data: BannerResponse[] }>("/api/v1/owner/banners");
  return res.data.data;
}

export async function createBanner(body: BannerRequest, image?: File): Promise<void> {
  const formData = new FormData();
  if (image) formData.append("image", image);
  formData.append("data", new Blob([JSON.stringify(body)], { type: "application/json" }));
  await api.post("/api/v1/owner/banners", formData, { headers: { "Content-Type": undefined } });
}

export async function updateBanner(uuid: string, body: BannerRequest, image?: File): Promise<void> {
  const formData = new FormData();
  if (image) formData.append("image", image);
  formData.append("data", new Blob([JSON.stringify(body)], { type: "application/json" }));
  await api.put(`/api/v1/owner/banners/${uuid}`, formData, {
    headers: { "Content-Type": undefined },
  });
}

export async function deleteBanner(uuid: string): Promise<void> {
  await api.delete(`/api/v1/owner/banners/${uuid}`);
}

// ── Comment ───────────────────────────────────────────────────────────────────

export interface OwnerCommentResponse {
  commentId: number;
  commentUuid: string;
  productUuid: string;
  productName: string;
  userUuid: string;
  content: string;
  rating: number | null;
  isSecret: boolean;
  isOwnerReply: boolean;
  parentId: number | null;
  replies: OwnerCommentResponse[];
  createdAt: string;
}

export interface OwnerCommentPageResponse {
  content: OwnerCommentResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export async function getOwnerComments(page = 0, size = 10): Promise<OwnerCommentPageResponse> {
  const res = await api.get<{ data: OwnerCommentPageResponse }>("/api/v1/owner/comments", {
    params: { page, size },
  });
  return res.data.data;
}

export async function deleteOwnerComment(commentUuid: string): Promise<void> {
  await api.delete(`/api/v1/owner/comments/${commentUuid}`);
}

export async function replyOwnerComment(
  commentUuid: string,
  content: string
): Promise<OwnerCommentResponse> {
  const res = await api.post<{ data: OwnerCommentResponse }>(
    `/api/v1/owner/comments/${commentUuid}/reply`,
    { content }
  );
  return res.data.data;
}

// ── Daily Stock ───────────────────────────────────────────────────────────────

export interface DailyStockRegisterRequest {
  optionId: string;
  saleDate: string;
  stockType?: "NORMAL" | "EVENT" | "TIMESALE";
  salePrice?: number;
  totalQty: number;
  startAt?: string;
  endAt?: string;
  maxPurchaseCount?: number | null;
}

export interface DailyStockListResponse {
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
  startAt: string | null;
  endAt: string | null;
  maxPurchaseCount: number | null;
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

// ── Notice ────────────────────────────────────────────────────────────────────

export interface NoticeRequest {
  title: string;
  content: string;
  isVisible: boolean;
}

export interface OwnerNoticeResponse {
  noticeUuid: string;
  title: string;
  content: string;
  isVisible: boolean;
  createdAt: string;
}

export async function getOwnerNotices(): Promise<OwnerNoticeResponse[]> {
  const res = await api.get<{ data: OwnerNoticeResponse[] }>("/api/v1/owner/notices");
  return res.data.data;
}

export async function createNotice(body: NoticeRequest): Promise<void> {
  await api.post("/api/v1/owner/notices", body);
}

export async function updateNotice(uuid: string, body: NoticeRequest): Promise<void> {
  await api.put(`/api/v1/owner/notices/${uuid}`, body);
}

export async function deleteNotice(uuid: string): Promise<void> {
  await api.delete(`/api/v1/owner/notices/${uuid}`);
}

// ── Inquiry ───────────────────────────────────────────────────────────────────

export interface OwnerInquiryResponse {
  inquiryUuid: string;
  userUuid: string;
  title: string;
  content: string;
  status: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
}

export interface OwnerInquiryPageResponse {
  content: OwnerInquiryResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export async function getOwnerInquiries(page = 0, size = 10): Promise<OwnerInquiryPageResponse> {
  const res = await api.get<{ data: OwnerInquiryPageResponse }>("/api/v1/owner/inquiries", {
    params: { page, size },
  });
  return res.data.data;
}

export async function answerInquiry(uuid: string, answer: string): Promise<void> {
  await api.put(`/api/v1/owner/inquiries/${uuid}/answer`, { answer });
}

// ── Notification ──────────────────────────────────────────────────────────────

export interface NotificationItem {
  notificationUuid: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export async function getNotifications(): Promise<NotificationListResponse> {
  const res = await api.get<{ data: NotificationListResponse }>("/api/v1/owner/notifications");
  return res.data.data;
}

export async function markNotificationsRead(): Promise<void> {
  await api.patch("/api/v1/owner/notifications/read");
}
