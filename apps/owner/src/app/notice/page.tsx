"use client";

import { useState, useEffect } from "react";
import {
  getOwnerNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  type OwnerNoticeResponse,
  type NoticeRequest,
} from "@/api/owner";
import NoticeModal from "./_components/NoticeModal";
import { ConfirmModal } from "../product/_components/ConfirmModal";

export default function NoticePage() {
  const [notices, setNotices] = useState<OwnerNoticeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<OwnerNoticeResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    setError(null);
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    getOwnerNotices()
      .then(setNotices)
      .catch(() => setError("공지사항 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleCreate = async (data: NoticeRequest) => {
    await createNotice(data);
    refresh();
  };

  const handleUpdate = async (data: NoticeRequest) => {
    if (!editTarget) return;
    await updateNotice(editTarget.noticeUuid, data);
    refresh();
  };

  const handleDelete = (uuid: string) => {
    setActionError(null);
    setDeleteTarget(uuid);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNotice(deleteTarget);
      setDeleteTarget(null);
      refresh();
    } catch {
      setActionError("삭제에 실패했습니다.");
      setDeleteTarget(null);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (notice: OwnerNoticeResponse) => {
    setEditTarget(notice);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">공지사항 관리</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
        >
          + 등록
        </button>
      </div>

      {loading && <div className="py-20 text-center text-gray-400">불러오는 중...</div>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && notices.length === 0 && (
        <div className="py-20 text-center text-gray-500">등록된 공지사항이 없습니다.</div>
      )}

      <ul className="space-y-3">
        {notices.map((notice) => (
          <li
            key={notice.noticeUuid}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      notice.isVisible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {notice.isVisible ? "노출" : "비노출"}
                  </span>
                </div>
                <p className="truncate font-semibold text-gray-800">{notice.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{notice.content}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => openEdit(notice)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-rose-300 hover:text-rose-500"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(notice.noticeUuid)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-red-300 hover:text-red-500"
                >
                  삭제
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {showModal && (
        <NoticeModal
          initial={editTarget ?? undefined}
          onSave={editTarget ? handleUpdate : handleCreate}
          onClose={closeModal}
        />
      )}
      {actionError && <p className="mt-3 text-sm text-red-500">{actionError}</p>}
      {deleteTarget && (
        <ConfirmModal
          title="공지사항 삭제"
          message="공지사항을 삭제하시겠습니까?"
          variant="danger"
          confirmLabel="삭제"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
