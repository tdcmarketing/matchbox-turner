"use client";

import Link from "next/link";
import { Badge } from "@/components/ui";
import type { LeadSource, LeadStatus, ShowingStatus } from "@/lib/data/types";

export const leadStatusMeta: Record<LeadStatus, { label: string; tone: "neutral" | "red" | "green" | "amber" | "blue" | "ink" }> = {
  NEW: { label: "New", tone: "amber" },
  QUALIFIED: { label: "Qualified", tone: "blue" },
  DISQUALIFIED: { label: "Didn't qualify", tone: "neutral" },
  WAITLIST: { label: "Waitlist", tone: "neutral" },
  SCHEDULED: { label: "Tour booked", tone: "blue" },
  TOURED: { label: "Toured", tone: "green" },
  APPLIED: { label: "Applied", tone: "green" },
  LEASED: { label: "Leased", tone: "ink" },
  LOST: { label: "Lost", tone: "neutral" },
};

export const showingStatusMeta: Record<ShowingStatus, { label: string; tone: "neutral" | "red" | "green" | "amber" | "blue" | "ink" }> = {
  REQUESTED: { label: "Unconfirmed", tone: "amber" },
  CONFIRMED: { label: "Confirmed", tone: "green" },
  UNCONFIRMED_CANCELLED: { label: "Released", tone: "neutral" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
  NO_SHOW: { label: "No-show", tone: "red" },
  COMPLETED: { label: "Completed", tone: "blue" },
};

export const sourceLabel: Record<LeadSource, string> = {
  WEB: "matchboxrealty.com",
  ZILLOW: "Zillow",
  APARTMENTS: "Apartments.com",
  ZUMPER: "Zumper",
  RENT_MANAGER: "Rent Manager",
  REFERRAL: "Referral",
  PHONE: "Phone",
  WALK_IN: "Walk-in",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const m = leadStatusMeta[status];
  return (
    <Badge tone={m.tone} dot>
      {m.label}
    </Badge>
  );
}
export function ShowingStatusBadge({ status }: { status: ShowingStatus }) {
  const m = showingStatusMeta[status];
  return (
    <Badge tone={m.tone} dot>
      {m.label}
    </Badge>
  );
}

export function ListingLink({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <Link href={`/app/listings/${id}`} className="font-semibold text-ink hover:text-strike">
      {children}
    </Link>
  );
}
export function LeadLink({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <Link href={`/app/leads/${id}`} className="font-semibold text-ink hover:text-strike">
      {children}
    </Link>
  );
}
