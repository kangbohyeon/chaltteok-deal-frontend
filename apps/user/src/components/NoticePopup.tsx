"use client";

import { useEffect, useState } from "react";
import { getPopups, type PopupResponse } from "@/api/user";

function getHideUntilKey(uuid: string) {
  return `popup_hide_until_${uuid}`;
}

function isHidden(uuid: string): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(getHideUntilKey(uuid));
  if (!stored) return false;
  return new Date(stored) > new Date();
}

function setHideUntil(uuid: string, days: number) {
  const until = new Date();
  until.setDate(until.getDate() + days);
  localStorage.setItem(getHideUntilKey(uuid), until.toISOString());
}

export default function NoticePopup() {
  const [popups, setPopups] = useState<PopupResponse[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    getPopups()
      .then((all) => {
        setPopups(all.filter((p) => p.location === "POPUP" || p.location === null));
      })
      .catch(() => {});
  }, []);

  const visible = popups.filter(
    (p) => !isHidden(p.popupUuid) && !dismissed.has(p.popupUuid)
  );

  if (visible.length === 0) return null;

  const popup = visible[0];

  const dismiss = (days?: number) => {
    if (days) setHideUntil(popup.popupUuid, days);
    setDismissed((prev) => new Set(prev).add(popup.popupUuid));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="bg-rose-500 px-6 py-4">
          <h2 className="text-lg font-bold text-white">{popup.title}</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{popup.content}</p>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={() => dismiss(1)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              1일 보지 않음
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => dismiss(2)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              2일 보지 않음
            </button>
          </div>
          <button
            onClick={() => dismiss()}
            className="rounded-lg bg-rose-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
