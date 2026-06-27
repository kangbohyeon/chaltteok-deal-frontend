"use client";

import { useState, useEffect } from "react";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  type BannerResponse,
  type BannerRequest,
} from "@/api/owner";
import BannerModal from "./_components/BannerModal";
import { ConfirmModal } from "../product/_components/ConfirmModal";

export default function BannerPage() {
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<BannerResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    setError(null);
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    getBanners()
      .then(setBanners)
      .catch(() => setError("배너 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleCreate = async (data: BannerRequest, image?: File) => {
    await createBanner(data, image);
    refresh();
  };

  const handleUpdate = async (data: BannerRequest, image?: File) => {
    if (!editTarget) return;
    await updateBanner(editTarget.bannerUuid, data, image);
    refresh();
  };

  const handleDelete = (uuid: string) => {
    setActionError(null);
    setDeleteTarget(uuid);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBanner(deleteTarget);
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

  const openEdit = (banner: BannerResponse) => {
    setEditTarget(banner);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">배너 관리</h1>
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

      {!loading && !error && banners.length === 0 && (
        <div className="py-20 text-center text-gray-500">등록된 배너가 없습니다.</div>
      )}

      <ul className="space-y-3">
        {banners.map((banner) => (
          <li
            key={banner.bannerUuid}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      banner.isVisible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {banner.isVisible ? "노출" : "비노출"}
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    순서 {banner.sortOrder}
                  </span>
                  {banner.backgroundColor && (
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: banner.backgroundColor }}
                    />
                  )}
                </div>
                <p className="truncate font-semibold text-gray-800">
                  {banner.title ?? "(제목 없음)"}
                </p>
                {banner.subtitle && (
                  <p className="mt-0.5 truncate text-sm text-gray-500">{banner.subtitle}</p>
                )}
                {(banner.startDate || banner.endDate) && (
                  <p className="mt-1 text-xs text-gray-400">
                    {banner.startDate ?? "~"} ~ {banner.endDate ?? "~"}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => openEdit(banner)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-rose-300 hover:text-rose-500"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(banner.bannerUuid)}
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
        <BannerModal
          initial={
            editTarget
              ? {
                  title: editTarget.title,
                  subtitle: editTarget.subtitle,
                  linkUrl: editTarget.linkUrl,
                  backgroundColor: editTarget.backgroundColor,
                  sortOrder: editTarget.sortOrder,
                  isVisible: editTarget.isVisible,
                  startDate: editTarget.startDate,
                  endDate: editTarget.endDate,
                  initialImageUrl: editTarget.imageUrl,
                }
              : undefined
          }
          onSave={editTarget ? handleUpdate : handleCreate}
          onClose={closeModal}
        />
      )}
      {actionError && <p className="mt-3 text-sm text-red-500">{actionError}</p>}
      {deleteTarget && (
        <ConfirmModal
          title="배너 삭제"
          message="배너를 삭제하시겠습니까?"
          variant="danger"
          confirmLabel="삭제"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
