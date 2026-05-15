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
