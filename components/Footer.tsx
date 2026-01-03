"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} doncrytt
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            홈
          </Link>
          <Link
            href="/admin/login"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            관리자
          </Link>
        </div>
      </div>
    </footer>
  );
}
