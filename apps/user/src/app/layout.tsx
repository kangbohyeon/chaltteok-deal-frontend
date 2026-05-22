"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Geist } from "next/font/google";
import "./globals.css";
import { useAuthStore, useCartStore } from "@chaltteok/shared-store";
import NoticePopup from "@/components/NoticePopup";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } },
      }),
  );
  const role = useAuthStore((s) => s.role);
  const nickname = useAuthStore((s) => s.nickname);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const cartCount = useCartStore((s) => s.totalCount());
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50">
        <QueryClientProvider client={queryClient}>
          <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
              {/* 상단 바: 닉네임 + 로그인/로그아웃 */}
              <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-4 py-1.5 text-xs font-medium text-gray-500 border-gray-100">
                {role === "ROLE_USER" && nickname && (
                  <span className="text-rose-500 font-semibold">{nickname}님</span>
                )}
                {role ? (
                  <button
                    onClick={handleLogout}
                    className="hover:text-rose-500 transition-colors"
                  >
                    로그아웃
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-full bg-rose-500 px-3 py-1 text-white text-xs hover:bg-rose-600 transition-colors"
                  >
                    로그인
                  </Link>
                )}
              </div>

              {/* 하단 바: 로고 + 네비 탭 */}
              <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <Link href="/" className="text-xl font-bold text-rose-500">
                  찰떡
                </Link>

                <ul className="flex items-center gap-6 text-sm font-medium text-gray-600">
                  <li>
                    <Link href="/cart" className="relative inline-flex items-center hover:text-rose-500 transition-colors">
                      <span>장바구니</span>
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      )}
                    </Link>
                  </li>

                  {/* 고객센터 드롭다운 */}
                  <li className="relative group">
                    <button className="flex items-center gap-0.5 hover:text-rose-500 transition-colors">
                      고객센터
                      <svg className="w-3 h-3 mt-0.5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <ul className="absolute left-1/2 -translate-x-1/2 top-full pt-2 hidden group-hover:block z-50 min-w-28">
                      <div className="rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                        <li>
                          <Link
                            href="/notice"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                          >
                            공지사항
                          </Link>
                        </li>
                        {role === "ROLE_USER" && (
                          <li>
                            <Link
                              href="/inquiry"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                            >
                              1:1 문의
                            </Link>
                          </li>
                        )}
                      </div>
                    </ul>
                  </li>

                  {/* 내정보 드롭다운 (로그인 시) */}
                  {role === "ROLE_USER" && (
                    <li className="relative group">
                      <button className="flex items-center gap-0.5 hover:text-rose-500 transition-colors">
                        내정보
                        <svg className="w-3 h-3 mt-0.5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <ul className="absolute left-1/2 -translate-x-1/2 top-full pt-2 hidden group-hover:block z-50 min-w-28">
                        <div className="rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                          <li>
                            <Link
                              href="/profile"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                            >
                              마이페이지
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/history"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                            >
                              주문내역
                            </Link>
                          </li>
                        </div>
                      </ul>
                    </li>
                  )}
                </ul>
              </nav>
            </header>
            <main className="flex-1">{children}</main>
          </div>
          <NoticePopup />
        </QueryClientProvider>
      </body>
    </html>
  );
}
