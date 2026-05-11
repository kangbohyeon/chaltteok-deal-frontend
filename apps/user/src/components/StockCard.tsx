import Link from "next/link";
import { type OpenDailyStockResponse } from "@/api/user";

interface StockCardProps {
  stock: OpenDailyStockResponse;
  participated?: boolean;
}

export default function StockCard({ stock, participated = false }: StockCardProps) {
  const isSoldOut = stock.remainStock === 0;
  const isDisabled = isSoldOut || participated;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">{stock.productName}</h3>
        {participated ? (
          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            참여완료
          </span>
        ) : isSoldOut ? (
          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            품절
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
            한정 수량
          </span>
        )}
      </div>

      <p className="text-2xl font-bold text-gray-900">
        {stock.price.toLocaleString()}
        <span className="text-base font-normal text-gray-500">원</span>
      </p>

      <div className="text-sm text-gray-500 space-y-1">
        <p>판매일: {stock.saleDate}</p>
        <p>
          남은 수량:{" "}
          <span className={isSoldOut ? "text-gray-400" : "font-medium text-rose-500"}>
            {stock.remainStock}
          </span>
          <span className="text-gray-400"> / {stock.totalStock}개</span>
        </p>
        <p>1인 <span className="font-medium text-gray-700">{stock.maxPurchaseCount}회</span> 구매 가능</p>
      </div>

      {isDisabled ? (
        <div
          className={`mt-auto block rounded-lg py-2.5 text-center text-sm font-semibold ${
            participated
              ? "bg-gray-100 text-gray-400"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {participated ? "이미 참여하셨습니다" : "품절"}
        </div>
      ) : (
        <Link
          href="/order"
          className="mt-auto block rounded-lg bg-rose-500 py-2.5 text-center text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
        >
          참여하기
        </Link>
      )}
    </div>
  );
}
