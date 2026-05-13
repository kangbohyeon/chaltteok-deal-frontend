"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  deleteProduct,
  getProducts,
  registerProduct,
  toggleActive,
  toggleSoldOut,
  updateProduct,
  type ProductListResponse,
  type ProductRegisterRequest,
} from "@/api/owner";

// ── 모달 폼 상태 ──────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  price: number;
  descp: string;
  active: boolean;
  soldOut: boolean;
  recommended: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  price: 0,
  descp: "",
  active: true,
  soldOut: false,
  recommended: false,
};

function toFormState(p: ProductListResponse): FormState {
  return {
    name: p.name,
    price: p.price,
    descp: p.descp ?? "",
    active: p.active,
    soldOut: p.soldOut,
    recommended: p.recommended,
  };
}

// ── 모달 컴포넌트 ─────────────────────────────────────────────────────────────

interface ModalProps {
  title: string;
  form: FormState;
  preview: string | null;
  loading: boolean;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onToggleField: (field: "active" | "soldOut" | "recommended") => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

function ToggleRow({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
          active ? "bg-rose-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            active ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

function ProductModal({
  title,
  form,
  preview,
  loading,
  error,
  onChange,
  onToggleField,
  onImageChange,
  onRemoveImage,
  onSubmit,
  onClose,
}: ModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
            ×
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상품명 *</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              placeholder="꿀떡"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원) *</label>
            <input
              name="price"
              type="number"
              min={100}
              value={form.price}
              onChange={onChange}
              required
              placeholder="ex. 29000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상품 설명</label>
            <textarea
              name="descp"
              value={form.descp}
              onChange={onChange}
              rows={3}
              placeholder="상품에 대한 간단한 설명을 입력해주세요."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">상품 설정</label>
            <ToggleRow
              label="상품 노출"
              active={form.active}
              onToggle={() => onToggleField("active")}
            />
            <ToggleRow
              label="품절 여부"
              active={form.soldOut}
              onToggle={() => onToggleField("soldOut")}
            />
            <ToggleRow
              label="추천 상품"
              active={form.recommended}
              onToggle={() => onToggleField("recommended")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상품 이미지</label>
            {preview ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <Image src={preview} alt="미리보기" fill unoptimized className="object-contain" />
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute top-2 right-2 rounded-full bg-black/50 text-white text-xs px-2 py-1 hover:bg-black/70"
                >
                  삭제
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-lg border-2 border-dashed border-gray-300 py-6 text-sm text-gray-400 hover:border-rose-400 hover:text-rose-400 transition-colors"
              >
                클릭하여 이미지 첨부
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={onImageChange} className="hidden" />
          </div>


          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
            >
              {loading ? "처리 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 삭제 확인 모달 ─────────────────────────────────────────────────────────────

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 mx-4">
        <p className="text-sm text-gray-700 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 ────────────────────────────────────────────────────────────────

type ModalMode = { type: "create" } | { type: "edit"; product: ProductListResponse };

export default function ProductListPage() {
  const [products, setProducts] = useState<ProductListResponse[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalMode | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ProductListResponse | null>(null);

  const load = () => {
    getProducts()
      .then(setProducts)
      .catch(() => setPageError("상품 목록을 불러오지 못했습니다."))
      .finally(() => setPageLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    clearImage();
    setModalError(null);
    setModal({ type: "create" });
  };

  const openEdit = (p: ProductListResponse) => {
    setForm(toFormState(p));
    clearImage();
    setModalError(null);
    setModal({ type: "edit", product: p });
  };

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "price" ? Number(value) : value }));
  };

  const handleToggleField = (field: "active" | "soldOut" | "recommended") => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async () => {
    setModalError(null);
    setModalLoading(true);
    const body: ProductRegisterRequest = {
      name: form.name,
      price: form.price,
      descp: form.descp || undefined,
      isActive: form.active,
      isSoldOut: form.soldOut,
      isRecommended: form.recommended,
    };
    try {
      if (modal?.type === "create") {
        await registerProduct(body, image ?? undefined);
      } else if (modal?.type === "edit") {
        await updateProduct(modal.product.uuid, body, image ?? undefined);
      }
      setModal(null);
      clearImage();
      load();
    } catch {
      setModalError("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.uuid);
      setDeleteTarget(null);
      load();
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };


  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
        >
          + 상품 등록
        </button>
      </div>

      {pageError && <p className="text-sm text-red-500 mb-4">{pageError}</p>}

      {pageLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-400">등록된 상품이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
            >
              
                <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-gray-100">
                  {p.imageUrl&& <Image src={p.imageUrl} alt={p.name} fill unoptimized className="object-cover" />}
                </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                  {!p.active && (
                    <span className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-500">
                      비노출
                    </span>
                  )}
                  {p.soldOut && (
                    <span className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-500">
                      품절
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{p.price.toLocaleString()}원</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(p)}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  수정
                </button>
                <button
                  onClick={() => setDeleteTarget(p)}
                  className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <ProductModal
          title={modal.type === "create" ? "상품 등록" : "상품 수정"}
          form={form}
          preview={preview}
          loading={modalLoading}
          error={modalError}
          onChange={handleChange}
          onToggleField={handleToggleField}
          onImageChange={handleImageChange}
          onRemoveImage={clearImage}
          onSubmit={handleSubmit}
          onClose={() => {
            setModal(null);
            clearImage();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`"${deleteTarget.name}" 상품을 삭제하시겠습니까?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
