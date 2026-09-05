import { format, formatDistanceToNowStrict, isSameDay, isToday, isTomorrow, isYesterday } from "date-fns";

export const money = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export const fmtDate = (iso: string) => format(new Date(iso), "EEE, MMM d");
export const fmtDateLong = (iso: string) => format(new Date(iso), "EEEE, MMMM d");
export const fmtDateShort = (iso: string) => format(new Date(iso), "MMM d");
export const fmtTime = (iso: string) => format(new Date(iso), "h:mm a");
export const fmtDateTime = (iso: string) => `${format(new Date(iso), "EEE MMM d")}, ${fmtTime(iso)}`;

export function fmtRelativeDay(iso: string, now: Date): string {
  const d = new Date(iso);
  if (isSameDay(d, now)) return "Today";
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (isSameDay(d, tomorrow)) return "Tomorrow";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return "Yesterday";
  return fmtDate(iso);
}

export function fmtAgo(iso: string, now: Date): string {
  const ms = now.getTime() - new Date(iso).getTime();
  const abs = Math.abs(ms);
  const m = Math.round(abs / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ${ms > 0 ? "ago" : "from now"}`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ${ms > 0 ? "ago" : "from now"}`;
  const d = Math.round(h / 24);
  return `${d}d ${ms > 0 ? "ago" : "from now"}`;
}

export const beds = (n: number) => (n === 0 ? "Studio" : `${n} bed`);
export const baths = (n: number) => `${n} bath`;

export const initials = (first: string, last: string) => `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();

export { isToday, isTomorrow, isYesterday, formatDistanceToNowStrict };
