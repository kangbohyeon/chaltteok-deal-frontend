"use client";

interface Props {
  onClose: () => void;
  onResetPassword: () => void;
}

export default function AccountLockedModal({ onClose, onResetPassword }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl">
            🔒
          </div>
        </div>
        <h2 className="mb-2 text-center text-lg font-bold text-gray-900">계정이 잠겼습니다</h2>
        <p className="mb-6 text-center text-sm leading-relaxed text-gray-500">
          비밀번호를 5회 연속 잘못 입력하여 계정이 일시적으로 잠겼습니다.
          <br />
          30분 후 자동으로 잠금이 해제되며, 비밀번호 재설정으로 즉시 해제할 수도 있습니다.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            확인
          </button>
          <button
            type="button"
            onClick={onResetPassword}
            className="flex-1 rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
          >
            비밀번호 재설정
          </button>
        </div>
      </div>
    </div>
  );
}
