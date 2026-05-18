"use client";

import { useState } from "react";
import { type PopupRequest } from "@/api/owner";

interface Props {
  initial?: PopupRequest;
  onSave: (data: PopupRequest) => Promise<void>;
  onClose: () => void;
}

const LOCATION_OPTIONS = [
  { value: "POPUP", label: "팝업" },
  { value: "BANNER", label: "배너" },
];

export default function PopupModal({ initial, onSave, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [isVisible, setIsVisible] = useState(initial?.isVisible ?? true);
  const [location, setLocation] = useState(initial?.location ?? "POPUP");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [startTime, setStartTime] = useState(initial?.startTime ?? "");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave({
        title,
        content,
        isVisible,
        location: location || null,
        startDate: startDate || null,
        endDate: endDate || null,
        startTime: startTime || null,
        endTime: endTime || null,
      });
      onClose();
    } catch {
      setError("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="bg-rose-500 px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            {initial ? "팝업 수정" : "팝업 등록"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">노출 위치</label>
              <select
                value={location ?? "POPUP"}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {LOCATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input
                type="checkbox"
                id="isVisible"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="rounded border-gray-300 text-rose-500"
              />
              <label htmlFor="isVisible" className="text-sm text-gray-700">
                노출
              </label>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">노출 시작일</label>
              <input
                type="date"
                value={startDate ?? ""}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <span className="flex items-center text-sm text-gray-400 mt-5">~</span>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">노출 종료일</label>
              <input
                type="date"
                value={endDate ?? ""}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">노출 시작시간</label>
              <input
                type="time"
                value={startTime ?? ""}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <span className="flex items-center text-sm text-gray-400 mt-5">~</span>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">노출 종료시간</label>
              <input
                type="time"
                value={endTime ?? ""}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
