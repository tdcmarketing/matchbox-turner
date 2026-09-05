"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDemo } from "@/lib/store";
import { Logo, Matchstick } from "@/components/Logo";
import { Avatar, Button, Modal } from "@/components/ui";
import { cn } from "@/lib/cn";
import { fmtDateTime } from "@/lib/format";
import { DEMO_TODAY } from "@/lib/data/seed";
import {
  BarChart3,
  CalendarDays,
  Clock3,
  Home,
  KeyRound,
  LayoutDashboard,
  MessageSquareText,
  Plug,
  RotateCcw,
  Settings,
  Users,
  DoorOpen,
} from "lucide-react";

const nav = [
  { href: "/app", label: "Today", icon: LayoutDashboard, exact: true },
  { href: "/app/leads", label: "Leads", icon: Users },
  { href: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/app/showings", label: "Tours", icon: DoorOpen },
  { href: "/app/listings", label: "Listings", icon: Home },
  { href: "/app/lockboxes", label: "Lockboxes", icon: KeyRound },
  { href: "/app/messages", label: "Messages", icon: MessageSquareText },
  { href: "/app/reports", label: "Reports", icon: BarChart3 },
];
const bottomNav = [
  { href: "/app/settings/rent-manager", label: "Rent Manager", icon: Plug },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const demo = useDemo();
  const me = demo.agents.find((a) => a.id === demo.currentAgentId)!;
  const [clockOpen, setClockOpen] = useState(false);
  const now = demo.now();
  const offset = demo.clockOffsetMs !== 0;

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  return (
    <div className="min-h-screen flex bg-paper-2">
      <aside className="w-[232px] shrink-0 self-start bg-ink text-white flex flex-col sticky top-0 h-screen">
        <div className="px-5 h-16 flex items-center border-b border-white/10">
          <Logo href="/app" invert product />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map((n) => (
            <NavLink key={n.href} {...n} active={isActive(n.href, n.exact)} />
          ))}
          <div className="pt-4 pb-1 px-3 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/35">Setup</div>
          {bottomNav.map((n) => (
            <NavLink key={n.href} {...n} active={isActive(n.href, n.href === "/app/settings")} />
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={() => setClockOpen(true)} className={cn("w-full rounded-md px-3 py-2.5 text-left text-[12.5px] hover:bg-white/10", offset ? "bg-strike/20" : "bg-white/5")}>
            <div className="flex items-center gap-2 text-white/60">
              <Clock3 size={13} /> Demo clock {offset && <span className="ml-auto text-strike font-bold">moved</span>}
            </div>
            <div className="mt-0.5 font-semibold text-white tabular">{fmtDateTime(now.toISOString())}</div>
          </button>
          <div className="mt-3 flex items-center gap-2.5 px-1">
            <Avatar initials={me.initials} color={me.color} size={30} />
            <div className="text-[12.5px] leading-tight">
              <div className="font-semibold">{me.name}</div>
              <div className="text-white/50">{me.title}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">{children}</div>

      <Modal open={clockOpen} onClose={() => setClockOpen(false)} title="Demo clock">
        <p className="text-[14px] text-ink-3">
          Everything time-based (reminders, code release, what counts as today) runs off this clock, so you can walk the client through a tour without waiting.
        </p>
        <div className="mt-4 rounded-md bg-paper p-4">
          <div className="text-[12px] font-bold uppercase tracking-wider text-ash">Now</div>
          <div className="text-lg font-extrabold tabular text-ink">{fmtDateTime(now.toISOString())}</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            ["+15 min", 15 * 60000],
            ["+1 hour", 3600000],
            ["+4 hours", 4 * 3600000],
            ["+1 day", 86400000],
          ].map(([label, ms]) => (
            <Button key={label as string} variant="secondary" onClick={() => demo.setClockOffset(demo.clockOffsetMs + (ms as number))}>
              {label}
            </Button>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <div className="text-[12px] font-bold uppercase tracking-wider text-ash">Jump to a moment</div>
          {demo.showings
            .filter((s) => s.status === "CONFIRMED" && s.type === "SELF" && new Date(s.startsAt).getTime() > new Date(DEMO_TODAY).getTime() - 3600000)
            .slice(0, 3)
            .map((s) => {
              const lead = demo.leads.find((l) => l.id === s.leadId)!;
              const listing = demo.listings.find((l) => l.id === s.listingId)!;
              const t = new Date(new Date(s.startsAt).getTime() - (demo.settings.codeReleaseMinutes - 1) * 60000).toISOString();
              return (
                <button key={s.id} onClick={() => demo.jumpClockTo(t)} className="w-full text-left rounded-md border border-line px-3 py-2 hover:border-ink text-[13.5px]">
                  <span className="font-semibold text-ink">{lead.firstName}'s self-guided tour</span> at {listing.unitLabel} · {demo.settings.codeReleaseMinutes - 1} min before
                </button>
              );
            })}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => demo.setClockOffset(0)}>
            Reset clock
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm("Reset all demo data to the starting state?")) demo.resetDemo();
            }}
          >
            <RotateCcw size={14} /> Reset demo data
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: React.ComponentType<{ size?: number }>; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-semibold transition-colors",
        active ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5",
      )}
    >
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r bg-strike" />}
      <Icon size={16} />
      {label}
    </Link>
  );
}

export function PageHeader({ title, subtitle, action, eyebrow }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; eyebrow?: React.ReactNode }) {
  return (
    <div className="px-8 pt-7 pb-5 flex items-end justify-between gap-6">
      <div>
        {eyebrow && (
          <div className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-strike mb-1">
            <Matchstick size={12} className="text-ink" /> {eyebrow}
          </div>
        )}
        <h1 className="text-[26px] font-extrabold tracking-[-0.01em] text-ink leading-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-[14px] text-ash">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}

export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-8 pb-12", className)}>{children}</div>;
}
