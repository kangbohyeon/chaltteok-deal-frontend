"use client";

import { useId } from "react";

const BASE_BTN = "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors";
const VARIANT_CLASS = {
  danger: `${BASE_BTN} bg-red-500 text-white hover:bg-red-600`,
  default: `${BASE_BTN} bg-rose-500 text-white hover:bg-rose-600`,
} as const;

interface Props {
  title: string;
  message: string;
  mode?: "confirm" | "alert";
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmModal({
  title,
  message,
  mode = "confirm",
  confirmLabel = "확인",
  cancelLabel = "취소",
  variant = "default",
  onConfirm,
  onCancel,
}: Props) {
  const titleId = useId();
  const isAlert = mode === "alert";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (isAlert) onConfirm();
          else onCancel?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id={titleId} className="mb-2 text-base font-bold text-gray-900">
          {title}
        </h2>
        <p className="mb-6 text-sm text-gray-700">{message}</p>
        <div className="flex gap-3">
          {!isAlert && (
            <button
              onClick={onCancel}
              className={`${BASE_BTN} border border-gray-300 text-gray-600 hover:bg-gray-50`}
            >
              {cancelLabel}
            </button>
          )}
          <button onClick={onConfirm} className={VARIANT_CLASS[variant]}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
