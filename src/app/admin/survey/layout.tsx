"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SUB_NAV = [
  { href: "/admin/survey/settings", label: "設定" },
  { href: "/admin/survey/responses", label: "回答・修正" },
  { href: "/admin/survey/aggregate", label: "集計" },
] as const;

export default function SurveyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {SUB_NAV.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-amber-500 text-white" : "bg-stone-200/80 text-stone-600 hover:bg-stone-300 hover:text-stone-800"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
