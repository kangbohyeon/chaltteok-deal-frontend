"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Geist } from "next/font/google";
import "./globals.css";
import { useAuthStore } from "@chaltteok/shared-store";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { role, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isLoggedIn = role === "ROLE_OWNER";
  const isLoginPage = pathname === "/login";

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50">
        <div className="flex flex-col min-h-screen">
          {isLoggedIn && !isLoginPage && (
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
              <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <Link href="/" className="text-xl font-bold text-rose-500">
                  찰떡 점주
                </Link>
                <ul className="flex items-center gap-6 text-sm font-medium text-gray-600">
                  <li>
                    <Link href="/product" className="hover:text-rose-500 transition-colors">
                      상품 관리
                    </Link>
                  </li>
                  <li>
                    <Link href="/stock" className="hover:text-rose-500 transition-colors">
                      재고 관리
                    </Link>
                  </li>
                  <li>
                    <Link href="/recommended" className="hover:text-rose-500 transition-colors">
                      추천 상품
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="text-gray-400 hover:text-rose-500 transition-colors"
                    >
                      로그아웃
                    </button>
                  </li>
                </ul>
              </nav>
            </header>
          )}
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
