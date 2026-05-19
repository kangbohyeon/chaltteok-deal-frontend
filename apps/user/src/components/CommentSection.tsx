"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@chaltteok/shared-store";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  replyComment,
  type CommentResponse,
} from "@/api/user";

interface Props {
  productUuid: string;
  commentCount: number;
}

function StarRating({
  value,
  onChange,
  readonly,
}: {
  value: number | null;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(s)}
          className={`text-xl leading-none transition-colors ${
            readonly ? "cursor-default" : "cursor-pointer hover:text-amber-400"
          } ${(value ?? 0) >= s ? "text-amber-400" : "text-gray-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

interface CommentFormProps {
  productUuid?: string;
  parentUuid?: string;
  initial?: { content: string; rating: number | null; isSecret: boolean };
  onSubmit: (content: string, rating: number | null, isSecret: boolean) => Promise<void>;
  onCancel?: () => void;
  isReply?: boolean;
}

function CommentForm({ initial, onSubmit, onCancel, isReply }: CommentFormProps) {
  const [content, setContent] = useState(initial?.content ?? "");
  const [rating, setRating] = useState<number | null>(initial?.rating ?? null);
  const [isSecret, setIsSecret] = useState(initial?.isSecret ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(content, isReply ? null : rating, isSecret);
      setContent("");
      setRating(null);
      setIsSecret(false);
    } catch {
      setError("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {!isReply && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">별점</span>
          <StarRating value={rating} onChange={setRating} />
        </div>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isReply ? "답글을 입력하세요..." : "댓글을 입력하세요..."}
        rows={2}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
      />
      <div className="flex items-center justify-between">
        {!isReply && (
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={isSecret}
              onChange={(e) => setIsSecret(e.target.checked)}
              className="rounded border-gray-300"
            />
            비밀 댓글
          </label>
        )}
        {isReply && <span />}
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "저장 중..." : "등록"}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}

interface CommentItemProps {
  comment: CommentResponse;
  currentUserId: number | null;
  onDeleted: () => void;
  onReplied: () => void;
  isNested?: boolean;
}

function CommentItem({ comment, currentUserId, onDeleted, onReplied, isNested }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleDelete = async () => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteComment(comment.commentUuid);
      onDeleted();
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  const handleEdit = async (content: string, rating: number | null, isSecret: boolean) => {
    await updateComment(comment.commentUuid, { content, rating, isSecret });
    setShowEditForm(false);
    onDeleted();
  };

  const handleReply = async (content: string) => {
    await replyComment(comment.commentUuid, content);
    setShowReplyForm(false);
    onReplied();
  };

  return (
    <div className={`${comment.isOwnerReply ? "ml-6 pl-3 border-l-2 border-rose-200" : ""}`}>
      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${comment.isOwnerReply ? "text-rose-600" : "text-gray-700"}`}>
              {comment.isOwnerReply ? "점주" : `사용자 ${comment.userId}`}
            </span>
            {comment.isSecret && (
              <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500">비밀</span>
            )}
            {comment.rating != null && (
              <StarRating value={comment.rating} readonly />
            )}
          </div>
          <span className="text-[10px] text-gray-400">
            {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
          </span>
        </div>
        {showEditForm ? (
          <CommentForm
            initial={{ content: comment.content, rating: comment.rating, isSecret: comment.isSecret }}
            onSubmit={handleEdit}
            onCancel={() => setShowEditForm(false)}
          />
        ) : (
          <p className="text-sm text-gray-700">{comment.content}</p>
        )}
        {!showEditForm && (
          <div className="flex gap-2">
            {comment.isMine && !comment.isOwnerReply && (
              <>
                <button
                  onClick={() => setShowEditForm(true)}
                  className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
                >
                  삭제
                </button>
              </>
            )}
            {!comment.isOwnerReply && !isNested && currentUserId != null && (
              <button
                onClick={() => setShowReplyForm((v) => !v)}
                className="text-[10px] text-gray-400 hover:text-rose-500 transition-colors"
              >
                답글
              </button>
            )}
          </div>
        )}
      </div>

      {showReplyForm && (
        <div className="mt-2 ml-4">
          <CommentForm
            isReply
            onSubmit={async (content) => handleReply(content)}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="mt-2 space-y-2 ml-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.commentUuid}
              comment={reply}
              currentUserId={currentUserId}
              onDeleted={onDeleted}
              onReplied={onReplied}
              isNested
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ productUuid, commentCount }: Props) {
  const { userId, role } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [liveCount, setLiveCount] = useState(commentCount);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getComments(productUuid, userId ?? undefined)
      .then((data) => {
        setComments(data);
        setLiveCount(data.length);
      })
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [open, refreshKey, productUuid, userId]);

  const handleCreate = async (content: string, rating: number | null, isSecret: boolean) => {
    await createComment(productUuid, { content, rating, isSecret });
    refresh();
  };

  return (
    <div className="border-t border-gray-100 mt-3 pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-rose-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        댓글 {open ? "접기" : `${liveCount > 0 ? `${liveCount}개 ` : ""}보기`}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {loading && <p className="text-xs text-gray-400">불러오는 중...</p>}

          {!loading && comments.length === 0 && (
            <p className="text-xs text-gray-400">첫 번째 댓글을 남겨보세요.</p>
          )}

          {!loading && comments.map((c) => (
            <CommentItem
              key={c.commentUuid}
              comment={c}
              currentUserId={userId}
              onDeleted={refresh}
              onReplied={refresh}
            />
          ))}

          {role === "ROLE_USER" && userId != null && (
            <div className="pt-2 border-t border-gray-100">
              <CommentForm productUuid={productUuid} onSubmit={handleCreate} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
