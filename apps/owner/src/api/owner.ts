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
  deleteImage?: boolean;
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
  try {
    await api.delete(`/api/v1/owner/products/${productUuid}`);
  } catch (error) {
    const serverMessage =
      error !== null &&
      typeof error === "object" &&
      "response" in error &&
      error.response !== null &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data !== null &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : null;
    throw serverMessage ? new Error(serverMessage) : error;
  }
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

// ── Time Sale Stock ───────────────────────────────────────────────────────────

export interface TimeSaleStockRegisterRequest {
  optionId: string;
  saleDate: string;
  stockType?: "NORMAL" | "EVENT" | "TIMESALE";
  salePrice?: number;
  totalQty: number;
  startAt?: string;
  endAt?: string;
  maxPurchaseCount?: number | null;
}

export interface TimeSaleStockListResponse {
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

export async function getTimeSaleStocks(): Promise<TimeSaleStockListResponse[]> {
  const res = await api.get<{ data: TimeSaleStockListResponse[] }>(
    "/api/v1/owner/time-sale-stocks"
  );
  return res.data.data;
}

export async function registerTimeSaleStock(body: TimeSaleStockRegisterRequest): Promise<void> {
  await api.post("/api/v1/owner/time-sale-stocks", body);
}

export async function updateTimeSaleStock(
  stockUuid: string,
  body: TimeSaleStockRegisterRequest
): Promise<void> {
  await api.put(`/api/v1/owner/time-sale-stocks/${stockUuid}`, body);
}

export async function deleteTimeSaleStock(stockUuid: string): Promise<void> {
  await api.delete(`/api/v1/owner/time-sale-stocks/${stockUuid}`);
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

// ── Order List ────────────────────────────────────────────────────────────────

export type OwnerOrderStatus = "COMPLETED" | "PENDING" | "CANCELLED";

export interface OwnerOrderSummaryResponse {
  orderNumber: string;
  productName: string;
  totalPrice: number;
  status: OwnerOrderStatus;
  orderedAt: string;
  itemCount: number;
}

export interface OwnerOrderListResponse {
  content: OwnerOrderSummaryResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export async function getOwnerOrders(
  status?: OwnerOrderStatus,
  page = 0,
  size = 20,
  startDate?: string,
  endDate?: string
): Promise<OwnerOrderListResponse> {
  const res = await api.get<{ data: OwnerOrderListResponse }>("/api/v1/owner/orders", {
    params: { status, page, size, startDate, endDate },
  });
  return res.data.data;
}

// ── Notification ──────────────────────────────────────────────────────────────

export interface NotificationItem {
  notificationUuid: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  orderNumber?: string | null;
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

// ── Order Detail ──────────────────────────────────────────────────────────────

export interface OwnerOrderItemResponse {
  productName: string;
  quantity: number;
  price: number;
}

export interface OwnerOrderPaymentResponse {
  amount: number;
  paymentMethod: string;
  status: string;
  paidAt: string | null;
}

export interface OwnerOrderDetailResponse {
  orderNumber: string;
  totalPrice: number;
  status: string;
  orderedAt: string;
  items: OwnerOrderItemResponse[];
  payment: OwnerOrderPaymentResponse | null;
  canCancel: boolean;
}

export async function getOwnerOrderDetail(orderNumber: string): Promise<OwnerOrderDetailResponse> {
  const res = await api.get<{ data: OwnerOrderDetailResponse }>(
    `/api/v1/owner/orders/${orderNumber}`
  );
  return res.data.data;
}

// ── Coupon ────────────────────────────────────────────────────────────────────

export type DiscountType = "RATE" | "AMOUNT";

export interface CouponRequest {
  code: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  totalQuantity: number | null;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive: boolean;
}

export interface CouponResponse {
  couponUuid: string;
  code: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  totalQuantity: number | null;
  usedQuantity: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export async function getCoupons(): Promise<CouponResponse[]> {
  const res = await api.get<{ data: CouponResponse[] }>("/api/v1/owner/coupons");
  return res.data.data;
}

export async function createCoupon(body: CouponRequest): Promise<CouponResponse> {
  const res = await api.post<{ data: CouponResponse }>("/api/v1/owner/coupons", body);
  return res.data.data;
}

export async function updateCoupon(uuid: string, body: CouponRequest): Promise<CouponResponse> {
  const res = await api.put<{ data: CouponResponse }>(`/api/v1/owner/coupons/${uuid}`, body);
  return res.data.data;
}

export async function deleteCoupon(uuid: string): Promise<void> {
  await api.delete(`/api/v1/owner/coupons/${uuid}`);
}

export async function toggleCouponActive(uuid: string): Promise<CouponResponse> {
  const res = await api.patch<{ data: CouponResponse }>(`/api/v1/owner/coupons/${uuid}/toggle`);
  return res.data.data;
}
