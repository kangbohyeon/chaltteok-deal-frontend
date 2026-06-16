"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@chaltteok/shared-store";
import { Pagination } from "@chaltteok/shared-ui";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  replyComment,
  type CommentResponse,
} from "@/api/user";
import { API_BASE_URL } from "@/lib/config";
import { useFileAttachment } from "@/hooks/useFileAttachment";
import AttachmentUploader from "@/components/AttachmentUploader";
import ConfirmModal from "@/components/ConfirmModal";

interface Props {
  productUuid: string;
  commentCount: number;
  defaultOpen?: boolean;
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
  onSubmit: (
    content: string,
    rating: number | null,
    isSecret: boolean,
    attachmentUuids: string[]
  ) => Promise<void>;
  onCancel?: () => void;
  isReply?: boolean;
}

function CommentForm({ initial, onSubmit, onCancel, isReply }: CommentFormProps) {
  const [content, setContent] = useState(initial?.content ?? "");
  const [rating, setRating] = useState<number | null>(initial?.rating ?? null);
  const [isSecret, setIsSecret] = useState(initial?.isSecret ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    previews,
    error: uploadError,
    addFiles,
    removeFile,
    uploadAll,
    reset: resetAttachments,
  } = useFileAttachment();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const attachmentUuids = await uploadAll();
      await onSubmit(content, isReply ? null : rating, isSecret, attachmentUuids);
      setContent("");
      setRating(null);
      setIsSecret(false);
      resetAttachments();
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
        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-rose-300 focus:outline-none"
      />
      <AttachmentUploader
        previews={previews}
        onAddFiles={addFiles}
        onRemove={removeFile}
        error={uploadError}
      />
      <div className="flex items-center justify-between">
        {!isReply && (
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-500">
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
              className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-50"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
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
  isLoggedIn: boolean;
  onDeleted: () => void;
  onReplied: () => void;
  isNested?: boolean;
  parentIsSecret?: boolean;
}

function CommentItem({
  comment,
  isLoggedIn,
  onDeleted,
  onReplied,
  isNested,
  parentIsSecret,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isContentMasked = (comment.isSecret && !comment.isMine) || (parentIsSecret ?? false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    try {
      await deleteComment(comment.commentUuid);
      onDeleted();
    } catch {
      setDeleteError("삭제에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  const handleEdit = async (
    content: string,
    rating: number | null,
    isSecret: boolean,
    attachmentUuids: string[]
  ) => {
    await updateComment(comment.commentUuid, { content, rating, isSecret, attachmentUuids });
    setShowEditForm(false);
    onDeleted();
  };

  const handleReply = async (
    content: string,
    _rating: number | null,
    _isSecret: boolean,
    attachmentUuids: string[]
  ) => {
    await replyComment(comment.commentUuid, content, attachmentUuids);
    setShowReplyForm(false);
    onReplied();
  };

  return (
    <>
      {showDeleteConfirm && (
        <ConfirmModal
          title="댓글 삭제"
          message="댓글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다."
          confirmLabel="삭제"
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      <div className={`${comment.isOwnerReply ? "ml-6 border-l-2 border-rose-200 pl-3" : ""}`}>
        <div className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold ${comment.isOwnerReply ? "text-rose-600" : "text-gray-700"}`}
              >
                {comment.isOwnerReply ? "점주" : (comment.nickname ?? "사용자")}
              </span>
              {comment.isSecret && (
                <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500">
                  비밀
                </span>
              )}
              {comment.rating != null && <StarRating value={comment.rating} readonly />}
            </div>
            <span className="text-[10px] text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
          {showEditForm ? (
            <CommentForm
              initial={{
                content: comment.content,
                rating: comment.rating,
                isSecret: comment.isSecret,
              }}
              onSubmit={handleEdit}
              onCancel={() => setShowEditForm(false)}
            />
          ) : isContentMasked ? (
            <p className="text-sm text-gray-400 italic">비밀댓글입니다.</p>
          ) : (
            <>
              <p className="text-sm text-gray-700">{comment.content}</p>
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {comment.attachments.map((att) => (
                    <a
                      key={att.attachmentUuid}
                      href={`${API_BASE_URL}${att.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={`${API_BASE_URL}${att.fileUrl}`}
                        alt={att.originalFilename}
                        className="h-14 w-14 rounded-lg border border-gray-200 object-cover transition-opacity hover:opacity-80"
                      />
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
          {!showEditForm && (
            <div className="flex gap-2">
              {comment.isMine && !comment.isOwnerReply && (
                <>
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="text-[10px] text-gray-400 transition-colors hover:text-gray-600"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-[10px] text-gray-400 transition-colors hover:text-red-500"
                  >
                    삭제
                  </button>
                </>
              )}
              {!comment.isOwnerReply && !isNested && isLoggedIn && (
                <button
                  onClick={() => setShowReplyForm((v) => !v)}
                  className="text-[10px] text-gray-400 transition-colors hover:text-rose-500"
                >
                  답글
                </button>
              )}
            </div>
          )}
        </div>

        {deleteError && <p className="mt-1 text-xs text-red-500">{deleteError}</p>}

        {showReplyForm && (
          <div className="mt-2 ml-4">
            <CommentForm isReply onSubmit={handleReply} onCancel={() => setShowReplyForm(false)} />
          </div>
        )}

        {comment.replies.length > 0 && (
          <div className="mt-2 ml-4 space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.commentUuid}
                comment={reply}
                isLoggedIn={isLoggedIn}
                onDeleted={onDeleted}
                onReplied={onReplied}
                isNested
                parentIsSecret={comment.isSecret && !comment.isMine}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function CommentSection({ productUuid, commentCount, defaultOpen = false }: Props) {
  const { role } = useAuthStore();
  const [open, setOpen] = useState(defaultOpen);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(commentCount);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setPage(0);
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getComments(productUuid, page, 5)
      .then((data) => {
        setComments(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      })
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [open, refreshKey, page, productUuid]);

  const handleCreate = async (
    content: string,
    rating: number | null,
    isSecret: boolean,
    attachmentUuids: string[]
  ) => {
    await createComment(productUuid, { content, rating, isSecret, attachmentUuids });
    refresh();
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-rose-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        댓글 {open ? "접기" : `${totalElements > 0 ? `${totalElements}개 ` : ""}보기`}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {loading && <p className="text-xs text-gray-400">불러오는 중...</p>}

          {!loading && comments.length === 0 && page === 0 && (
            <p className="text-xs text-gray-400">첫 번째 댓글을 남겨보세요.</p>
          )}

          {!loading &&
            comments.map((c) => (
              <CommentItem
                key={c.commentUuid}
                comment={c}
                isLoggedIn={role === "ROLE_USER"}
                onDeleted={refresh}
                onReplied={refresh}
              />
            ))}

          {!loading && (
            <div className="pt-1">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                size="xs"
                showPrevNext={false}
              />
            </div>
          )}

          {role === "ROLE_USER" && (
            <div className="border-t border-gray-100 pt-2">
              <CommentForm productUuid={productUuid} onSubmit={handleCreate} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
