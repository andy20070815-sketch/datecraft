"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/app/lib/i18n";
import { useAuth } from "@/app/lib/auth";

export default function NavBar() {
  const pathname = usePathname();
  const { lang, toggle, t } = useLanguage();
  const { user, loading, signIn, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      onClick={() => setMenuOpen(false)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        pathname === href ? "bg-[#be3a4a] text-white" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link href="/schedule" className="flex items-center gap-2 font-serif font-bold text-lg text-gray-900">
          <span className="text-[#be3a4a]">♥</span>
          <span>DateCraft</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLink("/schedule", t.schedule)}
          {navLink("/ideas", t.ideas)}
          <button
            onClick={toggle}
            className="ml-2 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
          >
            {lang === "en" ? "中文" : "EN"}
          </button>
          {!loading && (
            user ? (
              <div className="flex items-center gap-2 ml-2">
                {user.photoURL ? (
                  <Image src={user.photoURL} alt={user.displayName ?? ""} width={28} height={28} className="rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <button onClick={signOut} className="px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors">
                  {t.signOut}
                </button>
              </div>
            ) : (
              <button onClick={signIn} className="ml-2 px-4 py-1.5 rounded-full text-sm font-medium bg-[#be3a4a] text-white hover:bg-[#a3303f] transition-colors">
                {t.signIn}
              </button>
            )
          )}
        </nav>

        {/* Mobile right side */}
        <div className="flex sm:hidden items-center gap-2">
          {!loading && user?.photoURL && (
            <Image src={user.photoURL} alt={user.displayName ?? ""} width={26} height={26} className="rounded-full" />
          )}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 top-[57px] z-20 bg-white border-t border-gray-100 flex flex-col p-6 gap-3">
          {navLink("/schedule", t.schedule)}
          {navLink("/ideas", t.ideas)}
          <button
            onClick={() => { toggle(); }}
            className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-600 text-left"
          >
            {lang === "en" ? "切換至中文" : "Switch to English"}
          </button>
          {!loading && (
            user ? (
              <div className="flex flex-col gap-3 pt-2 border-t border-gray-100 mt-2">
                <div className="flex items-center gap-3">
                  {user.photoURL && <Image src={user.photoURL} alt={user.displayName ?? ""} width={32} height={32} className="rounded-full" />}
                  <span className="text-sm font-medium text-gray-700">{user.displayName}</span>
                </div>
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-600 text-left">
                  {t.signOut}
                </button>
              </div>
            ) : (
              <button onClick={() => { signIn(); setMenuOpen(false); }} className="px-4 py-2 rounded-full text-sm font-medium bg-[#be3a4a] text-white text-center mt-2">
                {t.signIn}
              </button>
            )
          )}
        </div>
      )}
    </>
  );
}
