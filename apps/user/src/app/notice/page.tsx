"use client";

import { useState, useEffect } from "react";
import { getNotices, type NoticeResponse } from "@/api/user";

export default function NoticePage() {
  const [notices, setNotices] = useState<NoticeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getNotices()
      .then(setNotices)
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">공지사항</h1>

      {loading && <div className="text-center py-20 text-gray-400">불러오는 중...</div>}

      {!loading && notices.length === 0 && (
        <div className="text-center py-20 text-gray-500">등록된 공지사항이 없습니다.</div>
      )}

      <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {notices.map((notice) => (
          <li key={notice.noticeUuid}>
            <button
              onClick={() => setExpanded(expanded === notice.noticeUuid ? null : notice.noticeUuid)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-800 text-sm">{notice.title}</span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-400">
                  {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 text-gray-400 transition-transform ${expanded === notice.noticeUuid ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {expanded === notice.noticeUuid && (
              <div className="px-5 pb-4 text-sm text-gray-600 whitespace-pre-wrap border-t border-gray-100 bg-gray-50">
                <p className="pt-3">{notice.content}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
