"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <Link href="/schedule" className="flex items-center gap-2 font-bold text-lg text-gray-900">
        <span className="text-[#be3a4a]">♥</span> DateCraft
      </Link>
      <nav className="flex items-center gap-1">
        <Link
          href="/schedule"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            pathname === "/schedule"
              ? "bg-[#be3a4a] text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Schedule
        </Link>
        <Link
          href="/new-date"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            pathname === "/new-date"
              ? "bg-[#be3a4a] text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          + New Date
        </Link>
        <Link
          href="/ideas"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
            pathname === "/ideas"
              ? "bg-[#be3a4a] text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          ✦ Ideas
        </Link>
      </nav>
    </header>
  );
}
