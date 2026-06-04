"use client";

import { API_BASE_URL } from "@/lib/config";

interface FilePreview {
  file: File;
  previewUrl: string;
}

interface AttachmentInfo {
  attachmentUuid: string;
  fileUrl: string;
  originalFilename: string;
}

interface Props {
  previews: FilePreview[];
  existingAttachments?: AttachmentInfo[];
  onAddFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
  error: string | null;
  maxCount?: number;
}

export default function AttachmentUploader({
  previews,
  existingAttachments = [],
  onAddFiles,
  onRemove,
  error,
  maxCount = 3,
}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onAddFiles(files);
    e.target.value = "";
  };

  const total = previews.length + existingAttachments.length;

  return (
    <div className="space-y-2">
      {(previews.length > 0 || existingAttachments.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {existingAttachments.map((att) => (
            <a
              key={att.attachmentUuid}
              href={`${API_BASE_URL}${att.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`${API_BASE_URL}${att.fileUrl}`}
                alt={att.originalFilename}
                loading="lazy"
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg border border-gray-200 object-cover transition-opacity hover:opacity-80"
              />
            </a>
          ))}
          {previews.map((p, i) => (
            <div key={i} className="relative">
              <img
                src={p.previewUrl}
                alt={p.file.name}
                loading="lazy"
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-700 text-[10px] text-white hover:bg-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      {total < maxCount && (
        <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-gray-400 transition-colors hover:text-rose-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
          사진 첨부 ({total}/{maxCount})
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleChange}
          />
        </label>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
