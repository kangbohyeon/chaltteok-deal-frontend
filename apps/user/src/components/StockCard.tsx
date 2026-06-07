"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type OpenDailyStockResponse } from "@/api/user";

interface StockCardProps {
  stock: OpenDailyStockResponse;
  participated?: boolean;
}

function useCountdown(endAt: string | null): { display: string; isUrgent: boolean } {
  const [display, setDisplay] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  useEffect(() => {
    if (!endAt) return;

    const tick = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) {
        setDisplay("마감");
        setIsUrgent(false);
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const hh = String(hours).padStart(2, "0");
      const mm = String(minutes).padStart(2, "0");
      const ss = String(seconds).padStart(2, "0");
      setDisplay(`${hh}:${mm}:${ss}`);
      setIsUrgent(diff < 3600 * 1000);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  return { display, isUrgent };
}

export default function StockCard({ stock, participated = false }: StockCardProps) {
  const isSoldOut = stock.remainStock === 0;
  const isDisabled = isSoldOut || participated;
  const { display: countdown, isUrgent } = useCountdown(stock.endAt);
  const hasTimesale = stock.endAt !== null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {hasTimesale && (
        <div className="flex items-center gap-2">
          <span className="rounded bg-red-500 px-2 py-0.5 text-xs font-bold tracking-wide text-white">
            TIMESALE
          </span>
          {countdown && countdown !== "마감" ? (
            <span
              className={`text-xs font-semibold ${isUrgent ? "text-red-500" : "text-gray-500"}`}
            >
              {countdown}
            </span>
          ) : countdown === "마감" ? (
            <span className="text-xs font-semibold text-gray-400">마감</span>
          ) : null}
        </div>
      )}

      <div className="flex items-start justify-between">
        <h3 className="text-lg leading-tight font-semibold text-gray-900">{stock.productName}</h3>
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

      <div className="space-y-1 text-sm text-gray-500">
        <p>판매일: {stock.saleDate}</p>
        <p>
          남은 수량:{" "}
          <span className={isSoldOut ? "text-gray-400" : "font-medium text-rose-500"}>
            {stock.remainStock}
          </span>
          <span className="text-gray-400"> / {stock.totalStock}개</span>
        </p>
        <p>
          1인 <span className="font-medium text-gray-700">{stock.maxPurchaseCount}회</span> 구매
          가능
        </p>
      </div>

      {isDisabled ? (
        <div
          className={`mt-auto block rounded-lg py-2.5 text-center text-sm font-semibold ${
            participated ? "bg-gray-100 text-gray-400" : "bg-gray-100 text-gray-400"
          }`}
        >
          {participated ? "이미 참여하셨습니다" : "품절"}
        </div>
      ) : (
        <Link
          href={`/order?stockId=${stock.id}`}
          className="mt-auto block rounded-lg bg-rose-500 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-rose-600"
        >
          참여하기
        </Link>
      )}
    </div>
  );
}
