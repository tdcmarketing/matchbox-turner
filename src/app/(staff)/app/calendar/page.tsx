"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/lib/store";
import { Page, PageHeader } from "@/components/staff/Shell";
import { Avatar, Button } from "@/components/ui";
import { fmtTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { addDays, isSameDay, startOfWeek } from "date-fns";
import { KeyRound } from "lucide-react";

const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i); // 8am..8pm
const ROW = 56;

export default function CalendarPage() {
  const demo = useDemo();
  const now = demo.now();
  const [weekOffset, setWeekOffset] = useState(0);
  const [agentFilter, setAgentFilter] = useState<string>("ALL");
  const start = addDays(startOfWeek(now, { weekStartsOn: 1 }), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  const visible = demo.showings.filter((s) => !["CANCELLED", "UNCONFIRMED_CANCELLED"].includes(s.status)).filter((s) => agentFilter === "ALL" || (agentFilter === "SELF" ? s.type === "SELF" : s.agentId === agentFilter));

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle={`${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${addDays(start, 6).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
        action={
          <>
            <div className="inline-flex rounded-md border border-line bg-white p-0.5 mr-2">
              <button onClick={() => setAgentFilter("ALL")} className={cn("px-3 h-8 rounded text-[13px] font-semibold", agentFilter === "ALL" ? "bg-ink text-white" : "text-ink-3")}>
                Everyone
              </button>
              {demo.agents.map((a) => (
                <button key={a.id} onClick={() => setAgentFilter(a.id)} className={cn("px-3 h-8 rounded text-[13px] font-semibold flex items-center gap-1.5", agentFilter === a.id ? "bg-ink text-white" : "text-ink-3")}>
                  <span className="size-2 rounded-full" style={{ background: a.color }} /> {a.name.split(" ")[0]}
                </button>
              ))}
              <button onClick={() => setAgentFilter("SELF")} className={cn("px-3 h-8 rounded text-[13px] font-semibold flex items-center gap-1.5", agentFilter === "SELF" ? "bg-ink text-white" : "text-ink-3")}>
                <KeyRound size={12} /> Self-guided
              </button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setWeekOffset(weekOffset - 1)}>
              ‹
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setWeekOffset(0)}>
              This week
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setWeekOffset(weekOffset + 1)}>
              ›
            </Button>
          </>
        }
      />
      <Page>
        <div className="bg-white rounded-lg border border-line-soft shadow-card overflow-hidden">
          <div className="grid" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
            <div className="border-b border-r border-line-soft" />
            {days.map((d) => {
              const today = isSameDay(d, now);
              return (
                <div key={d.toISOString()} className={cn("px-3 py-2.5 border-b border-line-soft text-center", today && "bg-strike-soft/50")}>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-ash">{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                  <div className={cn("text-lg font-extrabold tabular leading-tight", today ? "text-strike" : "text-ink")}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>
          <div className="grid relative" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
            <div className="border-r border-line-soft">
              {HOURS.map((h) => (
                <div key={h} className="text-[11px] text-ash tabular text-right pr-2 -mt-2 first:mt-0" style={{ height: ROW }}>
                  {h > 12 ? h - 12 : h}
                  {h >= 12 ? "pm" : "am"}
                </div>
              ))}
            </div>
            {days.map((d) => {
              const dayShowings = visible.filter((s) => isSameDay(new Date(s.startsAt), d));
              const today = isSameDay(d, now);
              const nowTop = ((now.getHours() + now.getMinutes() / 60 - 8) / 13) * ROW * 13;
              return (
                <div key={d.toISOString()} className={cn("relative border-r border-line-soft last:border-r-0", today && "bg-strike-soft/20")} style={{ height: ROW * 13 }}>
                  {HOURS.map((h) => (
                    <div key={h} className="border-b border-line-soft/70" style={{ height: ROW }} />
                  ))}
                  {today && nowTop > 0 && nowTop < ROW * 13 && (
                    <div className="absolute left-0 right-0 z-10 flex items-center" style={{ top: nowTop }}>
                      <span className="size-2 rounded-full bg-strike -ml-1" />
                      <span className="h-px flex-1 bg-strike" />
                    </div>
                  )}
                  {dayShowings.map((s) => {
                    const st = new Date(s.startsAt);
                    const top = ((st.getHours() + st.getMinutes() / 60 - 8) / 13) * ROW * 13;
                    const lead = demo.leads.find((l) => l.id === s.leadId)!;
                    const listing = demo.listings.find((l) => l.id === s.listingId)!;
                    const agent = s.agentId ? demo.agents.find((a) => a.id === s.agentId) : undefined;
                    const color = agent?.color ?? "#050708";
                    const faded = s.status === "REQUESTED";
                    return (
                      <Link
                        key={s.id}
                        href={`/app/lead/?id=${lead.id}`}
                        className={cn("absolute left-1 right-1 rounded-md px-2 py-1 text-[11.5px] leading-tight overflow-hidden border", faded ? "bg-white border-dashed" : "text-white")}
                        style={{ top: top + 1, height: ROW / 2 - 2, background: faded ? undefined : color, borderColor: color }}
                        title={`${lead.firstName} ${lead.lastName} · ${listing.unitLabel}`}
                      >
                        <div className={cn("font-bold truncate flex items-center gap-1", faded && "text-ink")}>
                          {s.type === "SELF" ? <KeyRound size={10} /> : null}
                          {fmtTime(s.startsAt)} {lead.firstName} {lead.lastName[0]}.
                        </div>
                        <div className={cn("truncate", faded ? "text-ink-3" : "text-white/80")}>{listing.unitLabel}{faded ? " · unconfirmed" : ""}</div>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[12.5px] text-ink-3">
          {demo.agents.map((a) => (
            <span key={a.id} className="inline-flex items-center gap-1.5">
              <Avatar initials={a.initials} color={a.color} size={16} /> {a.name}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="size-4 rounded-full bg-ink text-white inline-flex items-center justify-center">
              <KeyRound size={9} />
            </span>
            Self-guided
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-4 rounded border border-dashed border-ink-3" /> Unconfirmed
          </span>
        </div>
      </Page>
    </>
  );
}
