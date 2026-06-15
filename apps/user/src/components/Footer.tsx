import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* 링크 */}
        <nav className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
          <Link href="/" className="transition-colors hover:text-rose-500">
            홈
          </Link>
          <Link href="/history" className="transition-colors hover:text-rose-500">
            주문내역
          </Link>
          <Link href="/cart" className="transition-colors hover:text-rose-500">
            장바구니
          </Link>
        </nav>
        {/* 서비스명 + 카피라이트 */}
        <div className="text-xs text-gray-400">
          <p className="mb-1 font-semibold text-gray-500">찰떡딜</p>
          <p>© 2024 찰떡딜. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
