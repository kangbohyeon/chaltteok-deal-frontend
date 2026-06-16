"use client";

import Image from "next/image";
import { useRef } from "react";
import { type FormState } from "./types";
import { ToggleRow } from "./ToggleRow";

export interface ModalProps {
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
  existingImageUrl?: string | null;
  onDeleteExistingImage?: () => void;
}

export function ProductModal({
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
  existingImageUrl,
  onDeleteExistingImage,
}: ModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
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
            <label className="mb-1 block text-sm font-medium text-gray-700">상품명 *</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              placeholder="꿀떡"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">가격 (원) *</label>
            <input
              name="price"
              type="number"
              min={100}
              value={form.price}
              onChange={onChange}
              required
              placeholder="ex. 29000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">상품 설명</label>
            <textarea
              name="descp"
              value={form.descp}
              onChange={onChange}
              rows={3}
              placeholder="상품에 대한 간단한 설명을 입력해주세요."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              노출 순서
              <span className="ml-1 text-xs text-gray-400">(숫자가 낮을수록 먼저 표시)</span>
            </label>
            <input
              name="displayOrder"
              type="number"
              min={0}
              value={form.displayOrder}
              onChange={onChange}
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              일별 재고 수량
              <span className="ml-1 text-xs text-gray-400">(비워두면 무제한)</span>
            </label>
            <input
              name="stockQuantity"
              type="number"
              min={0}
              value={form.stockQuantity ?? ""}
              onChange={onChange}
              placeholder="예: 30"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
            {form.stockQuantity === 0 && (
              <p className="mt-1 text-xs text-red-500">수량 0 입력 시 즉시 품절 처리됩니다.</p>
            )}
          </div>

          {form.stockQuantity != null && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                현재 잔고
                <span className="ml-1 text-xs text-gray-400">(오늘 남은 재고)</span>
              </label>
              <input
                name="currentStock"
                type="number"
                min={0}
                max={form.stockQuantity ?? undefined}
                value={form.currentStock ?? ""}
                onChange={onChange}
                placeholder={`최대 ${form.stockQuantity}`}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:ring-2 focus:ring-rose-400 focus:outline-none"
              />
              {form.currentStock === 0 && (
                <p className="mt-1 text-xs text-orange-500">잔고 0: 저장 시 품절 처리됩니다.</p>
              )}
              {(form.currentStock ?? 0) > 0 && (
                <p className="mt-1 text-xs text-green-600">양수 입력 시 품절이 자동 해제됩니다.</p>
              )}
            </div>
          )}

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
            <label className="mb-1 block text-sm font-medium text-gray-700">상품 이미지</label>
            {preview ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <Image src={preview} alt="미리보기" fill unoptimized className="object-contain" />
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white hover:bg-black/70"
                >
                  삭제
                </button>
              </div>
            ) : existingImageUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <Image
                  src={existingImageUrl}
                  alt="기존 이미지"
                  fill
                  unoptimized
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={onDeleteExistingImage}
                  className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white hover:bg-black/70"
                >
                  이미지 삭제
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-lg border-2 border-dashed border-gray-300 py-6 text-sm text-gray-400 transition-colors hover:border-rose-400 hover:text-rose-400"
              >
                클릭하여 이미지 첨부
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
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
