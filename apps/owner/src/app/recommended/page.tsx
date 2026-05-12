"use client";

import { useEffect, useState } from "react";
import {
  getProducts,
  toggleRecommend,
  type ProductListResponse,
} from "@/api/owner";

// ── 추천 등록 모달 ─────────────────────────────────────────────────────────────

function AddRecommendModal({
  candidates,
  loading,
  onSelect,
  onClose,
}: {
  candidates: ProductListResponse[];
  loading: boolean;
  onSelect: (product: ProductListResponse) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8 mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">추천 상품 등록</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        {candidates.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">추천 가능한 상품이 없습니다.</p>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {candidates.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => onSelect(p)}
                  disabled={loading}
                  className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.price.toLocaleString()}원</p>
                  </div>
                  <span className="text-xs font-semibold text-rose-500">추천 등록 →</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >닫기</button>
      </div>
    </div>
  );
}

// ── 삭제(해제) 확인 모달 ───────────────────────────────────────────────────────

function ConfirmModal({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 mx-4">
        <p className="text-sm text-gray-700 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >취소</button>
          <button onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >해제</button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 ────────────────────────────────────────────────────────────────

export default function RecommendedManagePage() {
  const [products, setProducts] = useState<ProductListResponse[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ProductListResponse | null>(null);

  const load = () => {
    getProducts()
      .then(setProducts)
      .catch(() => setPageError("상품 목록을 불러오지 못했습니다."))
      .finally(() => setPageLoading(false));
  };

  useEffect(() => { load(); }, []);

  const recommended = products.filter((p) => p.isRecommended);
  const candidates = products.filter((p) => !p.isRecommended);

  const handleToggle = async (product: ProductListResponse) => {
    setToggling(product.id);
    try {
      await toggleRecommend(product.uuid);
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, isRecommended: !p.isRecommended } : p)
      );
    } catch {
      alert("추천 상태 변경에 실패했습니다.");
    } finally {
      setToggling(null);
    }
  };

  const handleAddSelect = async (product: ProductListResponse) => {
    setToggling(product.id);
    try {
      await toggleRecommend(product.uuid);
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, isRecommended: true } : p)
      );
      setShowAddModal(false);
    } catch {
      alert("추천 등록에 실패했습니다.");
    } finally {
      setToggling(null);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    await handleToggle(removeTarget);
    setRemoveTarget(null);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">추천 상품 관리</h1>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={candidates.length === 0 || pageLoading}
          className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
        >+ 추천 등록</button>
      </div>

      {pageError && <p className="text-sm text-red-500 mb-4">{pageError}</p>}

      {pageLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : recommended.length === 0 ? (
        <p className="text-sm text-gray-400">추천 등록된 상품이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {recommended.map((p) => (
            <li key={p.id}
              className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm"
            >
              <div>
                <p className="font-semibold text-gray-900">{p.name}</p>
                <p className="text-sm text-gray-500">{p.price.toLocaleString()}원</p>
              </div>
              <button
                onClick={() => setRemoveTarget(p)}
                disabled={toggling === p.id}
                className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {toggling === p.id ? "처리 중..." : "추천 해제"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {showAddModal && (
        <AddRecommendModal
          candidates={candidates}
          loading={toggling !== null}
          onSelect={handleAddSelect}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {removeTarget && (
        <ConfirmModal
          message={`"${removeTarget.name}" 상품의 추천을 해제하시겠습니까?`}
          onConfirm={handleRemove}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
