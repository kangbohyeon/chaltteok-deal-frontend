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
        <div className="flex min-h-screen flex-col">
          {isLoggedIn && !isLoginPage && (
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
              <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <Link href="/" className="text-xl font-bold text-rose-500">
                  찰떡 점주
                </Link>
                <ul className="flex items-center gap-6 text-sm font-medium text-gray-600">
                  <li>
                    <Link href="/product" className="transition-colors hover:text-rose-500">
                      상품 관리
                    </Link>
                  </li>
                  <li>
                    <Link href="/popup" className="transition-colors hover:text-rose-500">
                      팝업 관리
                    </Link>
                  </li>
                  <li>
                    <Link href="/banner" className="transition-colors hover:text-rose-500">
                      배너 관리
                    </Link>
                  </li>
                  <li>
                    <Link href="/comment" className="transition-colors hover:text-rose-500">
                      댓글 관리
                    </Link>
                  </li>
                  <li>
                    <Link href="/notice" className="transition-colors hover:text-rose-500">
                      공지사항
                    </Link>
                  </li>
                  <li>
                    <Link href="/inquiry" className="transition-colors hover:text-rose-500">
                      문의 관리
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="text-gray-400 transition-colors hover:text-rose-500"
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
