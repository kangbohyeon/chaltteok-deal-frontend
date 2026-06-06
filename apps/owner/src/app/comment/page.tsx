"use client";

import { useState, useEffect } from "react";
import {
  getOwnerComments,
  deleteOwnerComment,
  replyOwnerComment,
  type OwnerCommentResponse,
} from "@/api/owner";

const PAGE_SIZE = 10;

export default function CommentPage() {
  const [comments, setComments] = useState<OwnerCommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setLoading(true);
    setError(null);
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    getOwnerComments(page, PAGE_SIZE)
      .then((data) => {
        setComments(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      })
      .catch(() => setError("댓글 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [page, refreshKey]);

  const handleDelete = async (uuid: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteOwnerComment(uuid);
      refresh();
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  const handleReply = async (uuid: string) => {
    if (!replyContent.trim()) return;
    setReplyLoading(true);
    try {
      await replyOwnerComment(uuid, replyContent);
      setReplyTarget(null);
      setReplyContent("");
      refresh();
    } catch {
      alert("답글 등록에 실패했습니다.");
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">댓글 관리</h1>
        {totalElements > 0 && <span className="text-sm text-gray-500">총 {totalElements}개</span>}
      </div>

      {loading && <div className="py-20 text-center text-gray-400">불러오는 중...</div>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && comments.length === 0 && (
        <div className="py-20 text-center text-gray-500">등록된 댓글이 없습니다.</div>
      )}

      <ul className="space-y-4">
        {comments.map((comment) => (
          <li
            key={comment.commentUuid}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">
                    상품: {comment.productName}
                  </span>
                  {comment.isSecret && (
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                      비밀
                    </span>
                  )}
                  {comment.rating != null && (
                    <span className="text-xs text-amber-500">
                      {"★".repeat(comment.rating)}
                      {"☆".repeat(5 - comment.rating)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-800">{comment.content}</p>
                <p className="mt-1 text-xs text-gray-400">
                  사용자 {comment.userUuid.slice(0, 8)} ·{" "}
                  {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {!comment.replies.some((r) => r.isOwnerReply) && (
                  <button
                    onClick={() => {
                      setReplyTarget(
                        replyTarget === comment.commentUuid ? null : comment.commentUuid
                      );
                      setReplyContent("");
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-rose-300 hover:text-rose-500"
                  >
                    답글
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.commentUuid)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-red-300 hover:text-red-500"
                >
                  삭제
                </button>
              </div>
            </div>

            {replyTarget === comment.commentUuid && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="답글을 입력하세요..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:ring-2 focus:ring-rose-300 focus:outline-none"
                />
                <button
                  disabled={replyLoading || !replyContent.trim()}
                  onClick={() => handleReply(comment.commentUuid)}
                  className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
                >
                  {replyLoading ? "저장 중..." : "등록"}
                </button>
              </div>
            )}

            {comment.replies.length > 0 && (
              <ul className="mt-3 ml-4 space-y-2 border-l-2 border-rose-100 pl-3">
                {comment.replies.map((reply) => (
                  <li
                    key={reply.commentUuid}
                    className="rounded-lg border border-rose-100 bg-rose-50 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-rose-600">
                          {reply.isOwnerReply
                            ? "점주 답글"
                            : `사용자 ${reply.userUuid.slice(0, 8)}`}
                        </span>
                        <p className="mt-0.5 text-sm text-gray-800">{reply.content}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(reply.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(reply.commentUuid)}
                        className="ml-2 shrink-0 text-xs text-gray-400 transition-colors hover:text-red-500"
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
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
