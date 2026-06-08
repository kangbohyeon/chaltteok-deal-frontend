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

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function formatDatetimeRange(startAt: string | null, endAt: string | null): string {
  if (!startAt || !endAt) return "";
  const fmt = (s: string) => s.slice(0, 16).replace("T", " ");
  return `${fmt(startAt)} ~ ${fmt(endAt)}`;
}

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
    stockType: stock.stockType as "NORMAL" | "EVENT" | "TIMESALE",
    salePrice: stock.salePrice,
    totalQty: stock.totalQty,
    startAt: toDatetimeLocal(stock.startAt) || undefined,
    endAt: toDatetimeLocal(stock.endAt) || undefined,
    maxPurchaseCount: stock.maxPurchaseCount,
  };
}

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "예약됨",
  OPEN: "판매 중",
  SOLD_OUT: "품절",
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

function StockModal({
  title,
  form,
  products,
  loading,
  error,
  onChange,
  onSubmit,
  onClose,
}: StockModalProps) {
  const isTimesale = form.stockType === "TIMESALE";
  const isEvent = form.stockType === "EVENT";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-xl font-bold text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">상품 선택 *</label>
            <select
              name="optionId"
              value={form.optionId}
              onChange={onChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.optionUuid}>
                  {p.name} — {p.price.toLocaleString()}원
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">판매 날짜 *</label>
            <input
              name="saleDate"
              type="date"
              value={form.saleDate}
              onChange={onChange}
              required
              min={today()}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">재고 유형</label>
            <select
              name="stockType"
              value={form.stockType ?? "NORMAL"}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
            >
              <option value="NORMAL">일반 (NORMAL)</option>
              <option value="EVENT">이벤트 (EVENT)</option>
              <option value="TIMESALE">타임세일 (TIMESALE)</option>
            </select>
          </div>

          {(isEvent || isTimesale) && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {isTimesale ? "타임세일 가격 (원) *" : "이벤트 가격 (원) *"}
              </label>
              <input
                name="salePrice"
                type="number"
                min={1}
                value={form.salePrice ?? ""}
                onChange={onChange}
                required
                placeholder="ex. 19000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
              />
            </div>
          )}

          {isTimesale && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  타임세일 시작 시각 *
                </label>
                <input
                  name="startAt"
                  type="datetime-local"
                  value={form.startAt ?? ""}
                  onChange={onChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  타임세일 종료 시각 *
                </label>
                <input
                  name="endAt"
                  type="datetime-local"
                  value={form.endAt ?? ""}
                  onChange={onChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  1인 최대 구매 횟수
                  <span className="ml-1 text-xs font-normal text-gray-400">(미입력 시 무제한)</span>
                </label>
                <input
                  name="maxPurchaseCount"
                  type="number"
                  min={1}
                  max={99}
                  value={form.maxPurchaseCount ?? ""}
                  placeholder="무제한"
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">총 재고 수량 *</label>
            <input
              name="totalQty"
              type="number"
              min={1}
              value={form.totalQty}
              onChange={onChange}
              required
              placeholder="ex. 100"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
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
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <p className="mb-6 text-sm text-gray-700">{message}</p>
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

type ModalMode = { type: "create" } | { type: "edit"; stock: DailyStockListResponse };

export default function StockListPage() {
  const [stocks, setStocks] = useState<DailyStockListResponse[]>([]);
  const [products, setProducts] = useState<ProductListResponse[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalMode | null>(null);
  const [form, setForm] = useState<DailyStockRegisterRequest>({
    optionId: "",
    saleDate: today(),
    totalQty: 1,
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DailyStockListResponse | null>(null);

  const load = () => {
    Promise.all([getDailyStocks(), getProducts()])
      .then(([s, p]) => {
        setStocks(s);
        setProducts(p);
      })
      .catch(() => setPageError("데이터를 불러오지 못했습니다."))
      .finally(() => setPageLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

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
    setForm((prev) => {
      const next = {
        ...prev,
        [name]:
          name === "totalQty" || name === "salePrice"
            ? Number(value)
            : name === "maxPurchaseCount"
              ? value === ""
                ? undefined
                : Number(value)
              : value,
      };
      if (name === "stockType") {
        if (value !== "TIMESALE") {
          delete next.startAt;
          delete next.endAt;
          next.maxPurchaseCount = undefined;
        }
        if (value === "NORMAL") {
          next.salePrice = undefined;
        }
      }
      return next;
    });
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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">일일 재고 관리</h1>
        <button
          onClick={openCreate}
          disabled={products.length === 0}
          className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
        >
          + 재고 등록
        </button>
      </div>

      {pageError && <p className="mb-4 text-sm text-red-500">{pageError}</p>}

      {pageLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : stocks.length === 0 ? (
        <p className="text-sm text-gray-400">등록된 재고가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {stocks.map((s) => (
            <li
              key={s.uuid}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{s.productName}</p>
                  {s.stockType === "TIMESALE" && (
                    <span className="rounded bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                      타임세일
                    </span>
                  )}
                  {s.stockType === "EVENT" && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      이벤트
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {s.saleDate} · {s.salePrice.toLocaleString()}원 · {s.totalQty}개
                </p>
                {s.stockType === "TIMESALE" && s.startAt && s.endAt && (
                  <p className="mt-0.5 text-xs text-rose-500">
                    {formatDatetimeRange(s.startAt, s.endAt)}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-gray-400">
                  잔여 {s.remainStock}개 ·{" "}
                  <span className={s.status === "OPEN" ? "text-green-600" : "text-gray-400"}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                  {s.stockType === "TIMESALE" && (
                    <span className="ml-1 text-gray-400">
                      · 1인 {s.maxPurchaseCount !== null ? `${s.maxPurchaseCount}회` : "무제한"}
                    </span>
                  )}
                </p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-2">
                <button
                  onClick={() => openEdit(s)}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  수정
                </button>
                <button
                  onClick={() => setDeleteTarget(s)}
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
        <StockModal
          title={modal.type === "create" ? "재고 등록" : "재고 수정"}
          form={form}
          products={products}
          loading={modalLoading}
          error={modalError}
          onChange={handleChange}
          onSubmit={handleSubmit}
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
