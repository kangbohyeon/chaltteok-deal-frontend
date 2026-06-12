"use client";

import { useId } from "react";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  variant = "default",
  onConfirm,
  onCancel,
}: Props) {
  const titleId = useId();
  const isAlert = onCancel === undefined;

  const confirmButtonClass =
    variant === "danger"
      ? "flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
      : "flex-1 rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 transition-colors";

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
        <p className="mb-6 text-sm text-gray-600">{message}</p>
        <div className="flex gap-3">
          {!isAlert && (
            <button
              onClick={onCancel}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              {cancelLabel}
            </button>
          )}
          <button onClick={onConfirm} className={confirmButtonClass}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
