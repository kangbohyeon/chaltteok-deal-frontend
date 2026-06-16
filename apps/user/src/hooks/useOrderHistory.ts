"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cancelOrder as cancelOrderApi,
  getOrderHistory,
  type OrderHistoryPageResponse,
} from "@/api/user";

interface UseOrderHistoryOptions {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  paymentStatus?: string;
}

export function useOrderHistory({
  page = 0,
  size = 10,
  keyword,
  status,
  fromDate,
  toDate,
  paymentStatus,
}: UseOrderHistoryOptions = {}) {
  const [data, setData] = useState<OrderHistoryPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    getOrderHistory({ page, size, keyword, status, fromDate, toDate, paymentStatus })
      .then(setData)
      .catch(() => setError("주문 내역을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [page, size, keyword, status, fromDate, toDate, paymentStatus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [fetchOrders]);

  const cancelOrder = useCallback(
    async (orderNumber: string) => {
      await cancelOrderApi(orderNumber);
      fetchOrders();
    },
    [fetchOrders]
  );

  return {
    orders: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    currentPage: data?.currentPage ?? 0,
    loading,
    error,
    cancelOrder,
  };
}
