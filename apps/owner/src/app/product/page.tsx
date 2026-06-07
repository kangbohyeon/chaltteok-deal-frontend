"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  deleteProduct,
  deleteDailyStock,
  getDailyStocks,
  getProducts,
  registerProduct,
  updateProduct,
  type DailyStockListResponse,
  type ProductListResponse,
  type ProductRegisterRequest,
} from "@/api/owner";
import { type FormState, EMPTY_FORM, toFormState, toUpdateRequest } from "./_components/types";
import { ProductModal } from "./_components/ProductModal";
import { ConfirmModal } from "./_components/ConfirmModal";
import { TimesaleModal } from "./_components/TimesaleModal";

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
  const [timesaleModal, setTimesaleModal] = useState<ProductListResponse | null>(null);
  const [timesaleStocks, setTimesaleStocks] = useState<DailyStockListResponse[]>([]);
  const [ownerSort, setOwnerSort] = useState<"name" | "stock">("name");
  const [ownerSortDir, setOwnerSortDir] = useState<"asc" | "desc">("asc");

  const handleOwnerSortClick = (s: "name" | "stock") => {
    if (s === ownerSort) {
      setOwnerSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setOwnerSort(s);
      setOwnerSortDir("asc");
    }
  };

  const load = () => {
    Promise.all([getProducts(), getDailyStocks()])
      .then(([p, s]) => {
        setProducts(p);
        setTimesaleStocks(s.filter((s) => s.stockType === "TIMESALE"));
      })
      .catch(() => setPageError("상품 목록을 불러오지 못했습니다."))
      .finally(() => setPageLoading(false));
  };

  const handleTimesaleDelete = async (uuid: string) => {
    try {
      await deleteDailyStock(uuid);
      load();
    } catch {
      alert("삭제에 실패했습니다.");
    }
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
    } else if (name === "displayOrder") {
      setForm((prev) => ({ ...prev, displayOrder: value === "" ? 0 : Number(value) }));
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
    const createBody: ProductRegisterRequest = {
      name: form.name,
      price: form.price,
      descp: form.descp || undefined,
      isActive: form.active,
      isSoldOut: form.soldOut,
      isRecommended: form.recommended,
      stockQuantity: form.stockQuantity,
      displayOrder: form.displayOrder,
    };
    try {
      if (modal?.type === "create") {
        await registerProduct(createBody, image ?? undefined);
      } else if (modal?.type === "edit") {
        await updateProduct(modal.product.uuid, toUpdateRequest(form), image ?? undefined);
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

  const sortedProducts = useMemo(() => {
    const dir = ownerSortDir === "asc" ? 1 : -1;
    if (ownerSort === "stock") {
      return [...products].sort(
        (a, b) => dir * ((a.currentStock ?? Infinity) - (b.currentStock ?? Infinity))
      );
    }
    return [...products].sort((a, b) => dir * a.name.localeCompare(b.name, "ko"));
  }, [products, ownerSort, ownerSortDir]);

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
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
          <div className="flex items-center gap-2">
            {(["name", "stock"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleOwnerSortClick(s)}
                className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                  ownerSort === s
                    ? "border-rose-400 bg-rose-50 text-rose-600"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {s === "name" ? "이름순" : "남은재고순"}
                {ownerSort === s && (
                  <span className="ml-0.5">{ownerSortDir === "asc" ? " ↑" : " ↓"}</span>
                )}
              </button>
            ))}
          </div>
        </div>
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
          {sortedProducts.map((product) => {
            const productTimesales = timesaleStocks.filter((s) => s.productUuid === product.uuid);
            return (
              <li key={product.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-4 px-5 py-4">
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
                      onClick={() => setTimesaleModal(product)}
                      className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50"
                    >
                      타임세일
                    </button>
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
                </div>

                {productTimesales.length > 0 && (
                  <ul className="space-y-1.5 border-t border-gray-100 px-5 py-2">
                    {productTimesales.map((ts) => (
                      <li
                        key={ts.id}
                        className="flex items-center justify-between text-xs text-gray-500"
                      >
                        <span>
                          <span className="mr-1.5 rounded bg-red-500 px-1 py-0.5 font-bold text-white">
                            타임세일
                          </span>
                          {ts.startAt && ts.endAt
                            ? `${ts.startAt.slice(0, 16).replace("T", " ")} ~ ${ts.endAt.slice(11, 16)}`
                            : ts.saleDate}
                          {" · "}
                          {ts.salePrice.toLocaleString()}원 · 잔여 {ts.remainStock}/{ts.totalQty}개
                          {" · "}
                          <span
                            className={
                              ts.status === "OPEN"
                                ? "text-green-600"
                                : ts.status === "SCHEDULED"
                                  ? "text-blue-500"
                                  : "text-gray-400"
                            }
                          >
                            {ts.status === "SCHEDULED"
                              ? "예약됨"
                              : ts.status === "OPEN"
                                ? "판매 중"
                                : ts.status === "SOLD_OUT"
                                  ? "품절"
                                  : "마감"}
                          </span>
                        </span>
                        <button
                          onClick={() => handleTimesaleDelete(ts.uuid)}
                          className="ml-3 shrink-0 text-red-400 hover:text-red-600"
                        >
                          삭제
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
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

      {timesaleModal && (
        <TimesaleModal
          product={timesaleModal}
          onSuccess={() => {
            setTimesaleModal(null);
            load();
          }}
          onClose={() => setTimesaleModal(null)}
        />
      )}
    </div>
  );
}
