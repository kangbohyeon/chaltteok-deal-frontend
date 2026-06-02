"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  deleteProduct,
  getProducts,
  registerProduct,
  updateProduct,
  type ProductListResponse,
  type ProductRegisterRequest,
} from "@/api/owner";
import { type FormState, EMPTY_FORM, toFormState } from "./_components/types";
import { ProductModal } from "./_components/ProductModal";
import { ConfirmModal } from "./_components/ConfirmModal";

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
    if (name === "price") {
      setForm((prev) => ({ ...prev, price: Number(value) }));
    } else if (name === "stockQuantity") {
      setForm((prev) => ({ ...prev, stockQuantity: value === "" ? null : Number(value) }));
    } else if (name === "currentStock") {
      setForm((prev) => ({ ...prev, currentStock: value === "" ? null : Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
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
      stockQuantity: form.stockQuantity,
    };
    try {
      if (modal?.type === "create") {
        await registerProduct(body, image ?? undefined);
      } else if (modal?.type === "edit") {
        await updateProduct(
          modal.product.uuid,
          { ...body, currentStock: form.currentStock },
          image ?? undefined
        );
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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
        >
          + 상품 등록
        </button>
      </div>

      {pageError && <p className="mb-4 text-sm text-red-500">{pageError}</p>}

      {pageLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-400">등록된 상품이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-100">
                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <p className="truncate font-semibold text-gray-900">{product.name}</p>
                  <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                    {!product.active ? "비노출" : "노출"}
                  </span>
                  {product.soldOut && (
                    <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-500">
                      품절
                    </span>
                  )}
                  {product.recommended && (
                    <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-orange-500">
                      추천
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {product.price.toLocaleString()}원
                  {product.stockQuantity != null && (
                    <span className="ml-2 text-xs text-gray-400">
                      재고 {product.currentStock ?? 0}/{product.stockQuantity}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => openEdit(product)}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  수정
                </button>
                <button
                  onClick={() => setDeleteTarget(product)}
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
