"use client";

import { useState, useEffect } from "react";
import { getOwnerInquiries, answerInquiry, type OwnerInquiryResponse } from "@/api/owner";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "답변 대기",
  ANSWERED: "답변 완료",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ANSWERED: "bg-green-100 text-green-700",
};

const PAGE_SIZE = 10;

export default function InquiryPage() {
  const [inquiries, setInquiries] = useState<OwnerInquiryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [answerForms, setAnswerForms] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getOwnerInquiries(page, PAGE_SIZE)
      .then((data) => {
        setInquiries(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      })
      .catch(() => setError("문의 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [page, refreshKey]);

  const handleAnswer = async (uuid: string) => {
    const answer = answerForms[uuid]?.trim();
    if (!answer) return;
    setSubmitting(uuid);
    try {
      await answerInquiry(uuid, answer);
      setAnswerForms((prev) => ({ ...prev, [uuid]: "" }));
      setRefreshKey((k) => k + 1);
    } catch {
      alert("답변 등록에 실패했습니다.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">1:1 문의 관리</h1>
        {totalElements > 0 && <span className="text-sm text-gray-500">총 {totalElements}개</span>}
      </div>

      {loading && <div className="py-20 text-center text-gray-400">불러오는 중...</div>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && inquiries.length === 0 && (
        <div className="py-20 text-center text-gray-500">접수된 문의가 없습니다.</div>
      )}

      <ul className="space-y-3">
        {inquiries.map((inquiry) => (
          <li
            key={inquiry.inquiryUuid}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <button
              onClick={() =>
                setExpanded(expanded === inquiry.inquiryUuid ? null : inquiry.inquiryUuid)
              }
              className="flex w-full items-start justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLOR[inquiry.status] ?? "bg-gray-100 text-gray-500"}`}
                  >
                    {STATUS_LABEL[inquiry.status] ?? inquiry.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    사용자 {inquiry.userUuid.slice(0, 8)}
                  </span>
                </div>
                <p className="truncate text-sm font-semibold text-gray-800">{inquiry.title}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(inquiry.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`mt-1 h-4 w-4 shrink-0 text-gray-400 transition-transform ${expanded === inquiry.inquiryUuid ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expanded === inquiry.inquiryUuid && (
              <div className="space-y-4 border-t border-gray-100 bg-gray-50 px-5 pb-5">
                <div className="pt-3">
                  <p className="mb-1 text-xs font-medium text-gray-500">문의 내용</p>
                  <p className="text-sm whitespace-pre-wrap text-gray-700">{inquiry.content}</p>
                </div>

                {inquiry.answer ? (
                  <div className="rounded-lg border border-rose-100 bg-rose-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-rose-600">등록된 답변</p>
                    <p className="text-sm whitespace-pre-wrap text-gray-700">{inquiry.answer}</p>
                    {inquiry.answeredAt && (
                      <p className="mt-1 text-[10px] text-gray-400">
                        {new Date(inquiry.answeredAt).toLocaleDateString("ko-KR")}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500">답변 작성</p>
                    <textarea
                      value={answerForms[inquiry.inquiryUuid] ?? ""}
                      onChange={(e) =>
                        setAnswerForms((prev) => ({
                          ...prev,
                          [inquiry.inquiryUuid]: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="답변 내용을 입력하세요"
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-rose-300 focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleAnswer(inquiry.inquiryUuid)}
                        disabled={
                          submitting === inquiry.inquiryUuid ||
                          !answerForms[inquiry.inquiryUuid]?.trim()
                        }
                        className="rounded-lg bg-rose-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
                      >
                        {submitting === inquiry.inquiryUuid ? "등록 중..." : "답변 등록"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {!loading && totalPages > 0 && (
        <div className="mt-8 flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                page === i
                  ? "bg-rose-500 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
