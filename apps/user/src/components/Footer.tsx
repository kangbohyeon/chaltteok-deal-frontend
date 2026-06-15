export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-xs text-gray-400">
          <p className="mb-1 font-semibold text-gray-500">찰떡딜</p>
          <p>© {new Date().getFullYear()} 찰떡딜. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
