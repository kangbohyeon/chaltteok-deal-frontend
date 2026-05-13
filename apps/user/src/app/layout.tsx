"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Geist } from "next/font/google";
import "./globals.css";
import { useAuthStore, useCartStore } from "@chaltteok/shared-store";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } },
      }),
  );
  const { role, clearAuth } = useAuthStore();
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
              <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <Link href="/" className="text-xl font-bold text-rose-500">
                  찰떡
                </Link>
                <ul className="flex items-center gap-6 text-sm font-medium text-gray-600">
                  <li>
                    <Link href="/" className="hover:text-rose-500 transition-colors">
                      홈
                    </Link>
                  </li>

                  <li>
                    <Link href="/cart" className="relative inline-flex items-center hover:text-rose-500 transition-colors">
                      <span className="text">장바구니</span>
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      )}
                    </Link>
                  </li>

                  {!role && (
                    <>
                      <li>
                        <Link
                          href="/login"
                          className="rounded-full bg-rose-500 px-4 py-1.5 text-white hover:bg-rose-600 transition-colors"
                        >
                          로그인
                        </Link>
                      </li>
                    </>
                  )}

                  {role === "ROLE_USER" && (
                    <>
                      <li>
                        <Link href="/history" className="hover:text-rose-500 transition-colors">
                          주문내역
                        </Link>
                      </li>
                      <li>
                        <Link href="/profile" className="hover:text-rose-500 transition-colors">
                          내 정보
                        </Link>
                      </li>
                    </>
                  )}

                  {role && (
                    <li>
                      <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-rose-500 transition-colors"
                      >
                        로그아웃
                      </button>
                    </li>
                  )}
                </ul>
              </nav>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
