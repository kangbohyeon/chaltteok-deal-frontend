"use client";

import { useEffect, useState } from "react";
import {
  deleteDailyStock,
  getDailyStocks,
  getProducts,
  registerDailyStock,
  updateDailyStock,
  type DailyStockListResponse,
  type DailyStockRegisterRequest,
  type ProductListResponse,
} from "@/api/owner";

// ── 유틸 ──────────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split("T")[0];

function makeInitial(products: ProductListResponse[]): DailyStockRegisterRequest {
  return {
    optionId: products[0]?.optionUuid ?? "",
    saleDate: today(),
    stockType: "NORMAL",
    totalQty: 1,
  };
}

function stockFromExisting(
  stock: DailyStockListResponse,
  products: ProductListResponse[]
): DailyStockRegisterRequest {
  const product = products.find((p) => p.uuid === stock.productUuid);
  return {
    optionId: product?.optionUuid ?? stock.optionUuid,
    saleDate: stock.saleDate,
    stockType: stock.stockType as "NORMAL" | "EVENT",
    salePrice: stock.salePrice,
    totalQty: stock.totalQty,
  };
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: "판매 중",
  CLOSED: "마감",
  CANCELLED: "취소",
};

// ── 모달 컴포넌트 ─────────────────────────────────────────────────────────────

interface StockModalProps {
  title: string;
  form: DailyStockRegisterRequest;
  products: ProductListResponse[];
  loading: boolean;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: () => void;
  onClose: () => void;
}

function StockModal({ title, form, products, loading, error, onChange, onSubmit, onClose }: StockModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8 mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상품 선택 *</label>
            <select
              name="optionId" value={form.optionId} onChange={onChange} required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.optionUuid}>
                  {p.name} — {p.price.toLocaleString()}원
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">판매 날짜 *</label>
            <input
              name="saleDate" type="date" value={form.saleDate} onChange={onChange} required
              min={today()}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">재고 유형</label>
            <select
              name="stockType" value={form.stockType ?? "NORMAL"} onChange={onChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
            >
              <option value="NORMAL">일반 (NORMAL)</option>
              <option value="EVENT">이벤트 (EVENT)</option>
            </select>
          </div>

          {form.stockType === "EVENT" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이벤트 가격 (원) *</label>
              <input
                name="salePrice" type="number" min={1}
                value={form.salePrice ?? ""} onChange={onChange}
                required={form.stockType === "EVENT"}
                placeholder="ex. 19000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">총 재고 수량 *</label>
            <input
              name="totalQty" type="number" min={1} value={form.totalQty} onChange={onChange} required
              placeholder="ex. 100"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >취소</button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
            >{loading ? "처리 중..." : "저장"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 삭제 확인 모달 ─────────────────────────────────────────────────────────────

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
          >삭제</button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 ────────────────────────────────────────────────────────────────

type ModalMode = { type: "create" } | { type: "edit"; stock: DailyStockListResponse };

export default function StockListPage() {
  const [stocks, setStocks] = useState<DailyStockListResponse[]>([]);
  const [products, setProducts] = useState<ProductListResponse[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalMode | null>(null);
  const [form, setForm] = useState<DailyStockRegisterRequest>({ optionId: "", saleDate: today(), totalQty: 1 });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DailyStockListResponse | null>(null);

  const load = () => {
    Promise.all([getDailyStocks(), getProducts()])
      .then(([s, p]) => { setStocks(s); setProducts(p); })
      .catch(() => setPageError("데이터를 불러오지 못했습니다."))
      .finally(() => setPageLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(makeInitial(products));
    setModalError(null);
    setModal({ type: "create" });
  };

  const openEdit = (stock: DailyStockListResponse) => {
    setForm(stockFromExisting(stock, products));
    setModalError(null);
    setModal({ type: "edit", stock });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "totalQty" || name === "salePrice" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    setModalError(null);
    setModalLoading(true);
    try {
      if (modal?.type === "create") {
        await registerDailyStock(form);
      } else if (modal?.type === "edit") {
        await updateDailyStock(modal.stock.uuid, form);
      }
      setModal(null);
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
      await deleteDailyStock(deleteTarget.uuid);
      setDeleteTarget(null);
      load();
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">일일 재고 관리</h1>
        <button onClick={openCreate} disabled={products.length === 0}
          className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
        >+ 재고 등록</button>
      </div>

      {pageError && <p className="text-sm text-red-500 mb-4">{pageError}</p>}

      {pageLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : stocks.length === 0 ? (
        <p className="text-sm text-gray-400">등록된 재고가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {stocks.map((s) => (
            <li key={s.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{s.productName}</p>
                <p className="text-sm text-gray-500">
                  {s.saleDate} · {s.salePrice.toLocaleString()}원 · {s.totalQty}개
                  {s.stockType === "EVENT" && (
                    <span className="ml-1.5 rounded-full bg-amber-100 text-amber-700 text-xs px-2 py-0.5">이벤트</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  잔여 {s.remainStock}개 ·{" "}
                  <span className={s.status === "OPEN" ? "text-green-600" : "text-gray-400"}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button onClick={() => openEdit(s)}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >수정</button>
                <button onClick={() => setDeleteTarget(s)}
                  className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                >삭제</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <StockModal
          title={modal.type === "create" ? "재고 등록" : "재고 수정"}
          form={form} products={products}
          loading={modalLoading} error={modalError}
          onChange={handleChange} onSubmit={handleSubmit}
          onClose={() => setModal(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`"${deleteTarget.productName}" (${deleteTarget.saleDate}) 재고를 삭제하시겠습니까?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
