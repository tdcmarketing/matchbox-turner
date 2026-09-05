import type { AvailabilityRule, Listing, Showing } from "./data/types";

export interface Slot {
  startsAt: string;
  agentId?: string;
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Generate bookable slots for a listing over a date range.
 * Agent-led: union of assigned agents' weekly rules. Self: the listing's own windows.
 * Removes slots that collide with existing non-cancelled showings and anything inside minLeadHours.
 */
export function slotsFor(opts: {
  listing: Listing;
  type: "AGENT" | "SELF";
  rules: AvailabilityRule[];
  showings: Showing[];
  from: Date;
  days: number;
  now: Date;
  minLeadHours: number;
}): Record<string, Slot[]> {
  const { listing, type, rules, showings, from, days, now, minLeadHours } = opts;
  const out: Record<string, Slot[]> = {};
  const earliest = now.getTime() + minLeadHours * 3600_000;
  const active = showings.filter((s) => !["CANCELLED", "UNCONFIRMED_CANCELLED"].includes(s.status));

  for (let i = 0; i < days; i++) {
    const day = new Date(from);
    day.setDate(from.getDate() + i);
    day.setHours(0, 0, 0, 0);
    const key = day.toISOString().slice(0, 10);
    const weekday = day.getDay();
    const dayRules =
      type === "SELF"
        ? rules.filter((r) => r.listingId === listing.id && r.weekday === weekday)
        : rules.filter((r) => r.agentId && listing.agentIds.includes(r.agentId) && r.weekday === weekday);
    const slots: Slot[] = [];
    for (const r of dayRules) {
      for (let m = timeToMinutes(r.start); m + r.slotMinutes <= timeToMinutes(r.end); m += r.slotMinutes) {
        const start = new Date(day);
        start.setMinutes(m);
        if (start.getTime() < earliest) continue;
        const iso = start.toISOString();
        const clash = active.some((s) => {
          const sameTime = Math.abs(new Date(s.startsAt).getTime() - start.getTime()) < r.slotMinutes * 60000;
          if (!sameTime) return false;
          if (type === "SELF") return s.listingId === listing.id;
          return s.agentId === r.agentId;
        });
        if (clash) continue;
        if (!slots.some((s) => s.startsAt === iso)) slots.push({ startsAt: iso, agentId: r.agentId });
      }
    }
    slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    out[key] = slots;
  }
  return out;
}
