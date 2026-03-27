"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, ScanLine, Library } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/quest", label: "Quest", icon: Map },
  { href: "/scan", label: "Scan", icon: ScanLine },
  { href: "/rewards", label: "Rewards", icon: Library },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-border bg-white/95 backdrop-blur-md pb-safe">
      <div className="flex items-stretch">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
