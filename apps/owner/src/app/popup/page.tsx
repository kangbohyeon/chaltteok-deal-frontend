"use client";

import { useState, useEffect } from "react";
import {
  getPopups,
  createPopup,
  updatePopup,
  deletePopup,
  type PopupResponse,
  type PopupRequest,
} from "@/api/owner";
import PopupModal from "./_components/PopupModal";

const LOCATION_LABEL: Record<string, string> = {
  POPUP: "팝업",
  BANNER: "배너",
};

export default function PopupPage() {
  const [popups, setPopups] = useState<PopupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<PopupResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setLoading(true);
    setError(null);
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    getPopups()
      .then(setPopups)
      .catch(() => setError("팝업 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleCreate = async (data: PopupRequest) => {
    await createPopup(data);
    refresh();
  };

  const handleUpdate = async (data: PopupRequest) => {
    if (!editTarget) return;
    await updatePopup(editTarget.popupUuid, data);
    refresh();
  };

  const handleDelete = async (uuid: string) => {
    if (!confirm("팝업을 삭제하시겠습니까?")) return;
    try {
      await deletePopup(uuid);
      refresh();
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (popup: PopupResponse) => {
    setEditTarget(popup);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">팝업 관리</h1>
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

      {!loading && !error && popups.length === 0 && (
        <div className="py-20 text-center text-gray-500">등록된 팝업이 없습니다.</div>
      )}

      <ul className="space-y-3">
        {popups.map((popup) => (
          <li
            key={popup.popupUuid}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      popup.isVisible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {popup.isVisible ? "노출" : "비노출"}
                  </span>
                  {popup.location && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {LOCATION_LABEL[popup.location] ?? popup.location}
                    </span>
                  )}
                </div>
                <p className="truncate font-semibold text-gray-800">{popup.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{popup.content}</p>
                {(popup.startDate || popup.endDate) && (
                  <p className="mt-1 text-xs text-gray-400">
                    {popup.startDate ?? "~"} ~ {popup.endDate ?? "~"}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => openEdit(popup)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-rose-300 hover:text-rose-500"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(popup.popupUuid)}
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
        <PopupModal
          initial={
            editTarget
              ? {
                  title: editTarget.title,
                  content: editTarget.content,
                  isVisible: editTarget.isVisible,
                  location: editTarget.location,
                  startDate: editTarget.startDate,
                  endDate: editTarget.endDate,
                  startTime: editTarget.startTime,
                  endTime: editTarget.endTime,
                }
              : undefined
          }
          onSave={editTarget ? handleUpdate : handleCreate}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
