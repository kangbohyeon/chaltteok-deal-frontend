"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationItem } from "@/api/owner";

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 주문번호: 영대문자+숫자 혼합, 숫자 반드시 1개 이상 포함, 6자 이상 */
const ORDER_NUMBER_PATTERN = /(?=[A-Z0-9]*\d)[A-Z0-9]{6,}/;
const EXCLUDED_WORDS = new Set([
  "COMPLETED",
  "PENDING",
  "CANCELLED",
  "FAILED",
  "SUCCESS",
  "CARD",
  "TRANSFER",
]);

function extractOrderNumber(item: NotificationItem): string | null {
  const combined = `${item.title} ${item.message}`;
  const match = combined.match(ORDER_NUMBER_PATTERN);
  if (!match) return null;
  const candidate = match[0];
  if (EXCLUDED_WORDS.has(candidate)) return null;
  return candidate;
}

export default function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      await markRead();
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleToggle}
        className="relative flex items-center justify-center rounded-full p-1 text-gray-600 transition-colors hover:text-rose-500"
        aria-label="알림"
      >
        <span className="text-lg leading-none">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-4 py-2.5">
            <span className="text-sm font-semibold text-gray-700">알림</span>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">새 알림이 없습니다</li>
            ) : (
              notifications.map((item: NotificationItem) => {
                const orderNumber = extractOrderNumber(item);
                const handleClick = () => {
                  setOpen(false);
                  if (orderNumber) {
                    router.push("/orders/" + orderNumber);
                  } else {
                    router.push("/dashboard");
                  }
                };
                return (
                  <li
                    key={item.notificationUuid}
                    onClick={handleClick}
                    className={`cursor-pointer border-b border-gray-50 px-4 py-3 last:border-0 hover:bg-gray-50 ${
                      item.isRead ? "bg-white" : "bg-rose-50"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{item.message}</p>
                    <p className="mt-1 text-[11px] text-gray-400">{formatDate(item.createdAt)}</p>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
