"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/app/lib/i18n";
import { useAuth } from "@/app/lib/auth";

export default function NavBar() {
  const pathname = usePathname();
  const { lang, toggle, t } = useLanguage();
  const { user, loading, signIn, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <Link href="/schedule" className="flex items-center gap-2 font-bold text-lg text-gray-900">
        <span className="text-[#be3a4a]">♥</span> DateCraft
      </Link>
      <nav className="flex items-center gap-1">
        <Link href="/schedule" className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${pathname === "/schedule" ? "bg-[#be3a4a] text-white" : "text-gray-600 hover:text-gray-900"}`}>
          {t.schedule}
        </Link>
        <Link href="/ideas" className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${pathname === "/ideas" ? "bg-[#be3a4a] text-white" : "text-gray-600 hover:text-gray-900"}`}>
          {t.ideas}
        </Link>
        <Link href="/ask" className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${pathname === "/ask" ? "bg-[#be3a4a] text-white" : "text-gray-600 hover:text-gray-900"}`}>
          {t.askAi}
        </Link>
        <button
          onClick={toggle}
          className="ml-2 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
        >
          {lang === "en" ? "中文" : "EN"}
        </button>

        {!loading && (
          user ? (
            <div className="flex items-center gap-2 ml-2">
              {user.photoURL && (
                <Image
                  src={user.photoURL}
                  alt={user.displayName ?? ""}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              )}
              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
              >
                {t.signOut}
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="ml-2 px-4 py-1.5 rounded-full text-sm font-medium bg-[#be3a4a] text-white hover:bg-[#a3303f] transition-colors"
            >
              {t.signIn}
            </button>
          )
        )}
      </nav>
    </header>
  );
}
