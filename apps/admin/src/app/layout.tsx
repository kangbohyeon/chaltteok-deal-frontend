"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Geist } from "next/font/google";
import "./globals.css";
import { useAuthStore } from "@chaltteok/shared-store";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
            <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-xl font-bold text-gray-800">
                찰떡 관리자
              </Link>
              <ul className="flex items-center gap-6 text-sm font-medium text-gray-600">
                <li>
                  <Link href="/" className="transition-colors hover:text-gray-900">
                    관리자 홈
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 transition-colors hover:text-gray-600"
                  >
                    로그아웃
                  </button>
                </li>
              </ul>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
