"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type BannerResponse } from "@/api/user";

const SLIDE_INTERVAL_MS = 4000;
const FADE_DURATION_MS = 300;

const DEFAULT_GRADIENTS = [
  "from-rose-400 to-pink-600",
  "from-violet-400 to-purple-600",
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-500",
];

interface Props {
  banners: BannerResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export default function RollingBanner({ banners, isLoading, isError }: Props) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);
  const currentRef = useRef(0);

  const total = banners?.length ?? 0;

  const goTo = useCallback((index: number) => {
    setFading(true);
    setTimeout(() => {
      currentRef.current = index;
      setCurrent(index);
      setFading(false);
    }, FADE_DURATION_MS);
  }, []);

  useEffect(() => {
    if (paused || total <= 1) return;
    const timer = setInterval(() => {
      goTo((currentRef.current + 1) % total);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, goTo, total]);

  if (isLoading) {
    return <div className="h-44 rounded-2xl bg-gray-100 animate-pulse" />;
  }

  if (isError || !banners || total === 0) {
    return null;
  }

  const banner = banners[current];
  const gradient = DEFAULT_GRADIENTS[current % DEFAULT_GRADIENTS.length];
  const bgStyle = banner.backgroundColor ? { backgroundColor: banner.backgroundColor } : undefined;

  const content = (
    <div
      className={`relative w-full h-44 rounded-2xl overflow-hidden shadow-sm select-none ${!banner.backgroundColor ? `bg-linear-to-br ${gradient}` : ""}`}
      style={bgStyle}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 배경 이미지 */}
      {banner.imageUrl && (
        <Image
          src={banner.imageUrl}
          alt={banner.title ?? "배너"}
          fill
          unoptimized
          className="object-cover"
        />
      )}

      {/* 오버레이 (이미지가 있을 때 텍스트 가독성 확보) */}
      {banner.imageUrl && (
        <div className="absolute inset-0 bg-black/30" />
      )}

      {/* 텍스트 */}
      {(banner.title || banner.subtitle) && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center px-8 text-center transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
        >
          {banner.title && (
            <p className="text-2xl font-bold text-white drop-shadow leading-tight">
              {banner.title}
            </p>
          )}
          {banner.subtitle && (
            <p className="mt-2 text-sm text-white/90 drop-shadow leading-relaxed max-w-md">
              {banner.subtitle}
            </p>
          )}
        </div>
      )}

      {/* 이전 / 다음 화살표 */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); goTo((currentRef.current - 1 + total) % total); }}
            aria-label="이전 배너"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg hover:bg-white/30 shadow-sm transition-all"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.preventDefault(); goTo((currentRef.current + 1) % total); }}
            aria-label="다음 배너"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg hover:bg-white/30 shadow-sm transition-all"
          >
            ›
          </button>
        </>
      )}

      {/* 도트 인디케이터 */}
      {total > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); goTo(i); }}
              aria-label={`${i + 1}번째 배너`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-5 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (banner.linkUrl) {
    return (
      <Link href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </Link>
    );
  }

  return content;
}
