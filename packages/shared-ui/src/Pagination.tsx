"use client";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPrevNext?: boolean;
  size?: "xs" | "sm" | "md";
  windowSize?: number;
}

const SIZE_STYLES = {
  xs: {
    outerGap: "gap-1",
    button: "h-6 w-6 rounded text-xs font-medium",
    active: "bg-rose-500 text-white",
    inactive: "text-gray-500 hover:bg-gray-100",
    prevNext:
      "rounded text-xs font-medium px-2 py-1 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40",
  },
  sm: {
    outerGap: "gap-1",
    button: "h-8 w-8 rounded-lg text-xs font-medium",
    active: "bg-rose-500 text-white",
    inactive: "border border-gray-200 text-gray-600 hover:bg-gray-50",
    prevNext:
      "rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40",
  },
  md: {
    outerGap: "gap-2",
    button: "h-7 w-7 rounded-full text-xs font-semibold",
    active: "bg-rose-500 text-white",
    inactive: "text-gray-500 hover:bg-gray-100",
    prevNext:
      "rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40",
  },
} as const;

function getPageWindow(
  page: number,
  totalPages: number,
  windowSize: number
): (number | "ellipsis")[] {
  let start = Math.max(0, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages - 1, start + windowSize - 1);
  start = Math.max(0, end - windowSize + 1);

  const pages: (number | "ellipsis")[] = [];
  if (start > 0) {
    pages.push(0);
    if (start > 1) pages.push("ellipsis");
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) {
    if (end < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages - 1);
  }
  return pages;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  showPrevNext = true,
  size = "md",
  windowSize = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const style = SIZE_STYLES[size];
  const pages = getPageWindow(page, totalPages, windowSize);

  return (
    <div className={`flex items-center justify-center ${style.outerGap}`}>
      {showPrevNext && (
        <button
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className={style.prevNext}
        >
          이전
        </button>
      )}
      <div className="flex items-center gap-1">
        {pages.map((item, i) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-400">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`${style.button} transition-colors ${item === page ? style.active : style.inactive}`}
            >
              {item + 1}
            </button>
          )
        )}
      </div>
      {showPrevNext && (
        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page === totalPages - 1}
          className={style.prevNext}
        >
          다음
        </button>
      )}
    </div>
  );
}
