"use client";
import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@chaltteok/shared-store";
import { getNotifications, markNotificationsRead, type NotificationItem } from "@/api/owner";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      /* silent */
    }
  }, []);

  // 초기 로드 + SSE 실시간 구독
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 외부 REST API 동기화: 마운트 1회 fetch이므로 cascading render 없음
    void refresh();

    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    const es = new EventSource(
      `/api/v1/owner/notifications/sse?token=${encodeURIComponent(token)}`
    );
    es.addEventListener("order-confirmed", () => {
      void refresh();
    });
    es.onerror = () => {
      // CLOSED(2): 서버가 명시적으로 연결 종료 → 재연결 차단
      // CONNECTING(0): 브라우저가 자동 재연결 시도 중 → close 하지 않음
      if (es.readyState === EventSource.CLOSED) {
        es.close();
      }
    };
    return () => {
      es.close();
    };
  }, [refresh]);

  const markRead = useCallback(async () => {
    await markNotificationsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  return { notifications, unreadCount, markRead, refresh };
}
