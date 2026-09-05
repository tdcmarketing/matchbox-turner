"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Matchstick } from "@/components/Logo";

const sections = [
  { href: "/app", label: "Staff app", match: (p: string) => p.startsWith("/app") && !p.startsWith("/app/settings/rent-manager") },
  { href: "/listings", label: "Renter site", match: (p: string) => ["/listings", "/listing", "/book", "/tour", "/feedback"].some((x) => p === x || p.startsWith(x + "/") || p.startsWith(x + "?")) },
  { href: "/rm", label: "Rent Manager (simulated)", match: (p: string) => p.startsWith("/rm") },
  { href: "/app/settings/rent-manager", label: "Notes for Brian", match: (p: string) => p.startsWith("/app/settings/rent-manager") },
  { href: "/login", label: "Sign-in screen", match: (p: string) => p.startsWith("/login") },
];

/** Fixed top bar for the demo build so a viewer can jump between every section. */
export function DemoBar() {
  const pathname = usePathname() ?? "/";
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-10 bg-[#111316] border-b border-white/10 text-white flex items-center px-3 gap-1 text-[12.5px] font-semibold overflow-x-auto">
      <Link href="/" className="flex items-center gap-1.5 pr-3 mr-1 border-r border-white/15 text-white/80 hover:text-white whitespace-nowrap">
        <Matchstick size={14} className="text-white" />
        Matchbox Turner <span className="text-white/40 font-medium">demo</span>
      </Link>
      {sections.map((s) => {
        const active = s.match(pathname);
        return (
          <Link key={s.href} href={s.href} className={cn("px-2.5 h-7 inline-flex items-center rounded whitespace-nowrap", active ? "bg-white text-ink" : "text-white/65 hover:text-white hover:bg-white/10")}>
            {s.label}
          </Link>
        );
      })}
      <span className="ml-auto pl-3 text-[11.5px] text-white/40 whitespace-nowrap hidden md:inline">Staging · sample data · resets from the staff app clock</span>
    </div>
  );
}
