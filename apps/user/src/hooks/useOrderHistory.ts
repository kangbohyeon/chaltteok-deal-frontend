"use client";

import { useEffect, useState } from "react";
import { getOrderHistory, type OrderHistoryResponse } from "@/api/user";

export function useOrderHistory() {
  const [orders, setOrders] = useState<OrderHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrderHistory()
      .then(setOrders)
      .catch(() => setError("주문 내역을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  return { orders, loading, error };
}
