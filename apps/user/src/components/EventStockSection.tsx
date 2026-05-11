import { type OpenDailyStockResponse } from "@/api/user";
import StockCard from "./StockCard";

interface EventStockSectionProps {
  stocks: OpenDailyStockResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
  participatedIds?: number[];
}

export default function EventStockSection({
  stocks,
  isLoading,
  isError,
  participatedIds = [],
}: EventStockSectionProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-52 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-500">
        이벤트 상품을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  if (!stocks || stocks.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-12">
        오늘 진행 중인 이벤트 상품이 없습니다.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stocks.map((stock) => (
        <StockCard
          key={stock.id}
          stock={stock}
          participated={participatedIds.includes(stock.id)}
        />
      ))}
    </div>
  );
}
