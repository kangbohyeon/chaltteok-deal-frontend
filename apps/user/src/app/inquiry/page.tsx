"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@chaltteok/shared-store";
import { getMyInquiries, createInquiry, type InquiryResponse } from "@/api/user";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "답변 대기",
  ANSWERED: "답변 완료",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ANSWERED: "bg-green-100 text-green-700",
};

export default function InquiryPage() {
  const { role } = useAuthStore();
  const [inquiries, setInquiries] = useState<InquiryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchInquiries = () => {
    setLoading(true);
    getMyInquiries()
      .then(setInquiries)
      .catch(() => setInquiries([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (role === "ROLE_USER") fetchInquiries();
    else setLoading(false);
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createInquiry({ title, content });
      setTitle("");
      setContent("");
      setShowForm(false);
      fetchInquiries();
    } catch {
      setError("등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (role !== "ROLE_USER") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-gray-500">
        로그인 후 이용 가능합니다.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">1:1 문의</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
        >
          {showForm ? "취소" : "+ 문의하기"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3"
        >
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="문의 제목을 입력하세요"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="문의 내용을 입력하세요"
              rows={4}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-rose-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>
      )}

      {loading && <div className="text-center py-20 text-gray-400">불러오는 중...</div>}

      {!loading && inquiries.length === 0 && (
        <div className="text-center py-20 text-gray-500">등록된 문의가 없습니다.</div>
      )}

      <ul className="space-y-3">
        {inquiries.map((inquiry) => (
          <li
            key={inquiry.inquiryUuid}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === inquiry.inquiryUuid ? null : inquiry.inquiryUuid)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLOR[inquiry.status] ?? "bg-gray-100 text-gray-500"}`}
                >
                  {STATUS_LABEL[inquiry.status] ?? inquiry.status}
                </span>
                <span className="font-medium text-gray-800 text-sm">{inquiry.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400">
                  {new Date(inquiry.createdAt).toLocaleDateString("ko-KR")}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 text-gray-400 transition-transform ${expanded === inquiry.inquiryUuid ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {expanded === inquiry.inquiryUuid && (
              <div className="border-t border-gray-100 px-5 pb-4 space-y-3 bg-gray-50">
                <div className="pt-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">문의 내용</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{inquiry.content}</p>
                </div>
                {inquiry.answer && (
                  <div className="rounded-lg bg-rose-50 border border-rose-100 p-3">
                    <p className="text-xs font-semibold text-rose-600 mb-1">점주 답변</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{inquiry.answer}</p>
                    {inquiry.answeredAt && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(inquiry.answeredAt).toLocaleDateString("ko-KR")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
