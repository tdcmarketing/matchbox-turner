"use client";

import { useMemo, useState } from "react";
import { useDemo } from "@/lib/store";
import { slotsFor } from "@/lib/slots";
import { fmtDate, fmtRelativeDay, fmtTime } from "@/lib/format";
import { KeyRound, UserRound } from "lucide-react";

export function SlotPicker({
  listingId,
  tourType,
  setTourType,
  onPick,
  title = "Pick a time",
}: {
  listingId: string;
  tourType: "AGENT" | "SELF";
  setTourType: (t: "AGENT" | "SELF") => void;
  onPick: (startsAt: string, agentId?: string) => void;
  title?: string;
}) {
  const demo = useDemo();
  const listing = demo.listings.find((l) => l.id === listingId)!;
  const now = demo.now();
  const days = useMemo(
    () =>
      slotsFor({
        listing,
        type: tourType,
        rules: demo.availability,
        showings: demo.showings,
        from: now,
        days: 10,
        now,
        minLeadHours: demo.settings.minLeadHours,
      }),
    [listing, tourType, demo.availability, demo.showings, now, demo.settings.minLeadHours],
  );
  const dayKeys = Object.keys(days).filter((k) => days[k].length > 0);
  const [dayKey, setDayKey] = useState<string>(dayKeys[0]);
  const activeKey = dayKeys.includes(dayKey) ? dayKey : dayKeys[0];
  const allowBoth = listing.showingMode === "BOTH";

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
      <p className="mt-1 text-ink-3">Tours are 30 minutes. Times shown are Eastern.</p>

      {allowBoth && (
        <div className="mt-5 grid grid-cols-2 gap-2">
          {(
            [
              ["AGENT", "Guided tour", "Meet a leasing agent at the door", UserRound],
              ["SELF", "Self-guided", "Get a one-time lockbox code", KeyRound],
            ] as const
          ).map(([key, label, sub, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTourType(key)}
              className={`text-left rounded-md border p-3.5 transition-colors ${tourType === key ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink-3"}`}
            >
              <div className="flex items-center gap-2 font-bold text-[14.5px]">
                <Icon size={16} /> {label}
              </div>
              <div className={`text-[12.5px] mt-0.5 ${tourType === key ? "text-white/70" : "text-ash"}`}>{sub}</div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {dayKeys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setDayKey(k)}
            className={`shrink-0 rounded-md border px-3 py-2 text-left min-w-[84px] ${activeKey === k ? "border-strike bg-strike-soft" : "border-line bg-white hover:border-ink-3"}`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-ash">{fmtRelativeDay(k + "T12:00:00", now)}</div>
            <div className="text-[14px] font-bold text-ink">{fmtDate(k + "T12:00:00")}</div>
            <div className="text-[11.5px] text-ash tabular">{days[k].length} open</div>
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
        {activeKey &&
          days[activeKey].map((s) => (
            <button
              key={s.startsAt}
              type="button"
              onClick={() => onPick(s.startsAt, s.agentId)}
              className="h-10 rounded-md border border-line bg-white text-sm font-semibold text-ink hover:border-strike hover:text-strike tabular"
            >
              {fmtTime(s.startsAt)}
            </button>
          ))}
      </div>
    </div>
  );
}
