"use client";

import { useState, useEffect } from "react";
import { getCoupons, deleteCoupon, toggleCouponActive, type CouponResponse } from "@/api/owner";
import CouponModal from "./_components/CouponModal";
import { ConfirmModal } from "../product/_components/ConfirmModal";

export default function CouponPage() {
  const [coupons, setCoupons] = useState<CouponResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<CouponResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    setError(null);
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    getCoupons()
      .then(setCoupons)
      .catch(() => setError("쿠폰 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleDelete = (uuid: string) => {
    setActionError(null);
    setDeleteTarget(uuid);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCoupon(deleteTarget);
      setDeleteTarget(null);
      refresh();
    } catch {
      setActionError("삭제에 실패했습니다.");
      setDeleteTarget(null);
    }
  };

  const handleToggleActive = async (uuid: string) => {
    try {
      await toggleCouponActive(uuid);
      refresh();
    } catch {
      setActionError("상태 변경에 실패했습니다.");
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (coupon: CouponResponse) => {
    setEditTarget(coupon);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
  };

  const formatDiscount = (coupon: CouponResponse) => {
    if (coupon.discountType === "RATE") {
      return `${coupon.discountValue}%`;
    }
    return `${coupon.discountValue.toLocaleString()}원`;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">쿠폰 관리</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
        >
          + 쿠폰 생성
        </button>
      </div>

      {loading && <div className="py-20 text-center text-gray-400">불러오는 중...</div>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && coupons.length === 0 && (
        <div className="py-20 text-center text-gray-500">등록된 쿠폰이 없습니다.</div>
      )}

      {!loading && !error && coupons.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500">
                <th className="px-4 py-3">쿠폰명</th>
                <th className="px-4 py-3">코드</th>
                <th className="px-4 py-3">할인</th>
                <th className="px-4 py-3">사용수량</th>
                <th className="px-4 py-3">최소주문</th>
                <th className="px-4 py-3">유효기간</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => (
                <tr key={coupon.couponUuid} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{coupon.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{coupon.code}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDiscount(coupon)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {coupon.usedQuantity}
                    {coupon.totalQuantity != null ? ` / ${coupon.totalQuantity}` : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {coupon.minOrderAmount != null
                      ? `${coupon.minOrderAmount.toLocaleString()}원`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {coupon.startDate} ~ {coupon.endDate}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        coupon.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {coupon.isActive ? "활성" : "비활성"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEdit(coupon)}
                        className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-rose-300 hover:text-rose-500"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleToggleActive(coupon.couponUuid)}
                        className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-500"
                      >
                        {coupon.isActive ? "비활성화" : "활성화"}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.couponUuid)}
                        className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:border-red-300 hover:text-red-500"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CouponModal
          mode={editTarget ? "edit" : "create"}
          coupon={editTarget ?? undefined}
          onClose={closeModal}
          onSaved={refresh}
        />
      )}
      {actionError && <p className="mt-3 text-sm text-red-500">{actionError}</p>}
      {deleteTarget && (
        <ConfirmModal
          title="쿠폰 삭제"
          message="쿠폰을 삭제하시겠습니까?"
          variant="danger"
          confirmLabel="삭제"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
