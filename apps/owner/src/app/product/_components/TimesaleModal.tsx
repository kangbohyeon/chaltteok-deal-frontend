"use client";

import { useState } from "react";
import {
  registerTimeSaleStock,
  updateTimeSaleStock,
  type TimeSaleStockListResponse,
  type TimeSaleStockRegisterRequest,
  type ProductListResponse,
} from "@/api/owner";

const today = () => new Date().toISOString().split("T")[0];

const toDatetimeLocal = (val: string | null): string => {
  if (!val) return "";
  return val.slice(0, 16); // "YYYY-MM-DDTHH:mm"
};

interface TimesaleForm {
  saleDate: string;
  salePrice: number | "";
  startAt: string;
  endAt: string;
  maxPurchaseCount: number | "";
  totalQty: number;
}

const EMPTY: Omit<TimesaleForm, "saleDate"> = {
  salePrice: "",
  startAt: "",
  endAt: "",
  maxPurchaseCount: "",
  totalQty: 10,
};

interface TimesaleModalProps {
  product: ProductListResponse;
  editStock?: TimeSaleStockListResponse;
  onSuccess: () => void;
  onClose: () => void;
}

export function TimesaleModal({ product, editStock, onSuccess, onClose }: TimesaleModalProps) {
  const [form, setForm] = useState<TimesaleForm>(() => {
    if (editStock) {
      return {
        saleDate: editStock.saleDate,
        salePrice: editStock.salePrice,
        startAt: toDatetimeLocal(editStock.startAt),
        endAt: toDatetimeLocal(editStock.endAt),
        maxPurchaseCount: editStock.maxPurchaseCount ?? "",
        totalQty: editStock.totalQty,
      };
    }
    return { ...EMPTY, saleDate: today() };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "salePrice" || name === "maxPurchaseCount" || name === "totalQty"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startAt || !form.endAt) {
      setError("시작/종료 시각을 입력해주세요.");
      return;
    }
    if (form.endAt <= form.startAt) {
      setError("종료 시각은 시작 시각보다 이후여야 합니다.");
      return;
    }
    setError(null);
    setLoading(true);
    const body: TimeSaleStockRegisterRequest = {
      optionId: product.optionUuid,
      saleDate: form.saleDate,
      stockType: "TIMESALE",
      salePrice: form.salePrice === "" ? undefined : form.salePrice,
      totalQty: form.totalQty,
      startAt: form.startAt,
      endAt: form.endAt,
      maxPurchaseCount: form.maxPurchaseCount === "" ? null : form.maxPurchaseCount,
    };
    try {
      if (editStock) {
        await updateTimeSaleStock(editStock.uuid, body);
      } else {
        await registerTimeSaleStock(body);
      }
      onSuccess();
    } catch {
      setError("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {editStock ? "타임세일 수정" : "타임세일 등록"}
          </h2>
          <button onClick={onClose} className="text-xl font-bold text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        <p className="mb-5 text-sm text-gray-500">
          {product.name} — {product.price.toLocaleString()}원
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ts-saleDate" className="mb-1 block text-sm font-medium text-gray-700">
              판매 날짜 *
            </label>
            <input
              id="ts-saleDate"
              name="saleDate"
              type="date"
              value={form.saleDate}
              min={today()}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="ts-salePrice" className="mb-1 block text-sm font-medium text-gray-700">
              타임세일 가격 (원) *
            </label>
            <input
              id="ts-salePrice"
              name="salePrice"
              type="number"
              min={1}
              value={form.salePrice}
              onChange={handleChange}
              required
              placeholder="ex. 19000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ts-startAt" className="mb-1 block text-sm font-medium text-gray-700">
                시작 시각 *
              </label>
              <input
                id="ts-startAt"
                name="startAt"
                type="datetime-local"
                value={form.startAt}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="ts-endAt" className="mb-1 block text-sm font-medium text-gray-700">
                종료 시각 *
              </label>
              <input
                id="ts-endAt"
                name="endAt"
                type="datetime-local"
                value={form.endAt}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ts-totalQty" className="mb-1 block text-sm font-medium text-gray-700">
                총 재고 수량 *
              </label>
              <input
                id="ts-totalQty"
                name="totalQty"
                type="number"
                min={1}
                value={form.totalQty}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="ts-maxPurchaseCount"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                1인 최대 구매
                <span className="ml-1 text-xs font-normal text-gray-400">(미입력 시 무제한)</span>
              </label>
              <input
                id="ts-maxPurchaseCount"
                name="maxPurchaseCount"
                type="number"
                min={1}
                max={99}
                value={form.maxPurchaseCount}
                onChange={handleChange}
                placeholder="무제한"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
              />
            </div>
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
              {loading ? "처리 중..." : editStock ? "수정" : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
