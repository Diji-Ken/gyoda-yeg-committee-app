"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "ダッシュボード", icon: "M4 6h16M4 12h16M4 18h16" },
  { href: "/admin/schedule", label: "スケジュール", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/admin/minutes", label: "議事録", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/admin/materials", label: "共有資料・連絡", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
  { href: "/admin/ideas", label: "意見・アイデア", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { href: "/admin/survey", label: "アンケート", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/admin/members", label: "委員", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
] as const;

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-100/80 text-stone-800">
      {/* Mobile: menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-stone-200 shadow-sm">
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="p-2 -ml-2 rounded-lg text-stone-600 hover:bg-stone-100"
          aria-label="メニュー"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold text-stone-800">管理者</span>
        <div className="w-10" />
      </div>

      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-20 bg-stone-900/50 backdrop-blur-sm"
          aria-label="閉じる"
        />
      )}

      {/* Left sidebar - fixed on desktop, slide-in on mobile */}
      <aside
        className={`
          fixed top-0 left-0 z-20 h-full w-64 bg-white border-r border-stone-200
          flex flex-col shadow-xl
          transition-transform duration-200 ease-out
          md:translate-x-0 md:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-stone-200 md:pt-0 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">YEG</span>
            </div>
            <div>
              <p className="font-bold text-stone-800 leading-tight">管理者</p>
              <p className="text-xs text-stone-500 leading-tight">ビジネス協同委員会</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 rounded-lg text-stone-500 hover:bg-stone-100"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map(({ href, label, icon }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-800"
                  }
                `}
              >
                <NavIcon d={icon} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-stone-200 space-y-1 shrink-0">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            委員向けページ
          </Link>
          <Link
            href="/survey"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            アンケート回答
          </Link>
        </div>
      </aside>

      {/* Main content - offset by sidebar on desktop, below header on mobile */}
      <main className="md:ml-64 min-h-screen pt-14 md:pt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  );
}
