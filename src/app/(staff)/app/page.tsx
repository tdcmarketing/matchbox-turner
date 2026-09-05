"use client";

import Link from "next/link";
import { useDemo } from "@/lib/store";
import { Page, PageHeader } from "@/components/staff/Shell";
import { Avatar, Button, Card, CardHeader, Empty, Stat } from "@/components/ui";
import { LeadLink, LeadStatusBadge, ListingLink, ShowingStatusBadge, sourceLabel } from "@/components/staff/bits";
import { fmtAgo, fmtTime, isToday } from "@/lib/format";
import { KeyRound } from "lucide-react";
import { isSameDay } from "date-fns";

export default function Dashboard() {
  const demo = useDemo();
  const now = demo.now();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const todays = demo.showings
    .filter((s) => isSameDay(new Date(s.startsAt), now) && !["CANCELLED", "UNCONFIRMED_CANCELLED"].includes(s.status))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const unconfirmed = demo.showings.filter((s) => s.status === "REQUESTED" && new Date(s.startsAt) > now);
  const newLeads = demo.leads.filter((l) => new Date(l.createdAt) >= weekAgo);
  const inside = demo.showings.filter((s) => s.checkedInAt && !s.checkedOutAt);
  const activeListings = demo.listings.filter((l) => l.status === "ACTIVE");
  const needsAttention = demo.leads.filter((l) => l.status === "NEW" || l.status === "QUALIFIED").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const recentFeedback = demo.showings.filter((s) => s.feedback).sort((a, b) => b.feedback!.at.localeCompare(a.feedback!.at)).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        title={`Good ${now.getHours() < 12 ? "morning" : now.getHours() < 17 ? "afternoon" : "evening"}, ${demo.agents.find((a) => a.id === demo.currentAgentId)!.name.split(" ")[0]}.`}
        subtitle={`${todays.length} tour${todays.length === 1 ? "" : "s"} today · ${unconfirmed.length} waiting on confirmation · ${activeListings.length} homes on the market`}
        action={
          <Button href="/listings" variant="secondary">
            View renter site
          </Button>
        }
      />
      <Page>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="New leads, 7 days" value={newLeads.length} delta="+31% vs prior week" tone="good" />
          <Stat label="Tours this week" value={demo.showings.filter((s) => new Date(s.startsAt) >= weekAgo && new Date(s.startsAt).getTime() <= now.getTime() + 7 * 86400000 && s.status !== "CANCELLED").length} delta="4 self-guided" />
          <Stat label="Confirm rate" value="82%" delta="no-shows down 3" tone="good" />
          <Stat label="Lead → application" value="27%" delta="30-day" />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5">
            <Card>
              <CardHeader title="Today's tours" subtitle="Confirmed and requested, in order" action={<Link href="/app/calendar" className="text-[13px] font-semibold text-strike">Open calendar</Link>} />
              {todays.length === 0 ? (
                <Empty title="No tours today" body="Leads book directly from the listing pages. Nothing on the books yet." />
              ) : (
                <ul className="divide-y divide-line-soft">
                  {todays.map((s) => {
                    const lead = demo.leads.find((l) => l.id === s.leadId)!;
                    const listing = demo.listings.find((l) => l.id === s.listingId)!;
                    const property = demo.properties.find((p) => p.id === listing.propertyId)!;
                    const agent = s.agentId ? demo.agents.find((a) => a.id === s.agentId) : undefined;
                    const live = s.checkedInAt && !s.checkedOutAt;
                    return (
                      <li key={s.id} className="px-5 py-3.5 flex items-center gap-4">
                        <div className="w-[76px] shrink-0">
                          <div className="font-bold tabular text-ink">{fmtTime(s.startsAt)}</div>
                          <div className="text-[12px] text-ash">30 min</div>
                        </div>
                        <div className="shrink-0">
                          {agent ? <Avatar initials={agent.initials} color={agent.color} size={34} /> : (
                            <span className="size-[34px] rounded-full bg-ink text-white flex items-center justify-center">
                              <KeyRound size={15} />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <LeadLink id={lead.id}>
                              {lead.firstName} {lead.lastName}
                            </LeadLink>
                            {live && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-leaf uppercase"><span className="size-1.5 rounded-full bg-leaf animate-pulse" /> Inside now</span>}
                          </div>
                          <div className="text-[13px] text-ink-3 truncate">
                            <ListingLink id={listing.id}>{property.name} {listing.unitLabel}</ListingLink> · {agent ? `with ${agent.name.split(" ")[0]}` : "self-guided"}
                          </div>
                        </div>
                        <ShowingStatusBadge status={s.status} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card>
              <CardHeader title="Needs a human" subtitle="New leads without answers, and qualified leads who haven't booked" action={<Link href="/app/leads" className="text-[13px] font-semibold text-strike">All leads</Link>} />
              <ul className="divide-y divide-line-soft">
                {needsAttention.slice(0, 5).map((l) => {
                  const listing = demo.listings.find((x) => x.id === l.listingId)!;
                  const property = demo.properties.find((p) => p.id === listing.propertyId)!;
                  return (
                    <li key={l.id} className="px-5 py-3 flex items-center gap-4">
                      <Avatar initials={`${l.firstName[0]}${l.lastName[0]}`} size={34} />
                      <div className="flex-1 min-w-0">
                        <LeadLink id={l.id}>
                          {l.firstName} {l.lastName}
                        </LeadLink>
                        <div className="text-[13px] text-ink-3 truncate">
                          {property.name} {listing.unitLabel} · via {sourceLabel[l.source]} · {fmtAgo(l.createdAt, now)}
                        </div>
                      </div>
                      <LeadStatusBadge status={l.status} />
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader title="Waiting on confirmation" subtitle={`Auto-released ${demo.settings.confirmDeadlineHours}h before start if unconfirmed`} />
              {unconfirmed.length === 0 ? (
                <Empty title="Everyone's confirmed" />
              ) : (
                <ul className="divide-y divide-line-soft">
                  {unconfirmed.map((s) => {
                    const lead = demo.leads.find((l) => l.id === s.leadId)!;
                    const listing = demo.listings.find((l) => l.id === s.listingId)!;
                    return (
                      <li key={s.id} className="px-5 py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <LeadLink id={lead.id}>
                            {lead.firstName} {lead.lastName}
                          </LeadLink>
                          <div className="text-[13px] text-ink-3">
                            {isToday(new Date(s.startsAt)) ? "Today" : new Date(s.startsAt).toLocaleDateString("en-US", { weekday: "short" })} {fmtTime(s.startsAt)} · {listing.unitLabel}
                          </div>
                        </div>
                        <Button size="sm" variant="secondary" onClick={() => demo.confirmShowing(s.id)}>
                          Mark confirmed
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card>
              <CardHeader title="Inside a home right now" subtitle="Self-guided tours that checked in" />
              {inside.length === 0 ? (
                <div className="px-5 pb-5 text-[13.5px] text-ash">No one is inside a unit right now.</div>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {inside.map((s) => {
                    const lead = demo.leads.find((l) => l.id === s.leadId)!;
                    const listing = demo.listings.find((l) => l.id === s.listingId)!;
                    return (
                      <li key={s.id} className="px-5 py-3 flex items-center gap-3">
                        <span className="size-2 rounded-full bg-leaf animate-pulse" />
                        <div className="flex-1">
                          <LeadLink id={lead.id}>{lead.firstName} {lead.lastName}</LeadLink>
                          <div className="text-[13px] text-ink-3">{listing.unitLabel} · in since {fmtTime(s.checkedInAt!)} · code {s.accessCode}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card>
              <CardHeader title="Latest tour feedback" />
              <ul className="divide-y divide-line-soft">
                {recentFeedback.map((s) => {
                  const lead = demo.leads.find((l) => l.id === s.leadId)!;
                  const listing = demo.listings.find((l) => l.id === s.listingId)!;
                  return (
                    <li key={s.id} className="px-5 py-3">
                      <div className="flex items-center justify-between">
                        <LeadLink id={lead.id}>{lead.firstName} {lead.lastName}</LeadLink>
                        <span className="text-strike font-bold tracking-tight">{"★".repeat(s.feedback!.rating)}<span className="text-line">{"★".repeat(5 - s.feedback!.rating)}</span></span>
                      </div>
                      <div className="text-[13px] text-ink-3">{listing.unitLabel} · {s.feedback!.interested ? "wants to apply" : "passed"}</div>
                      {s.feedback!.comments && <div className="mt-1 text-[13.5px] text-ink-2">“{s.feedback!.comments}”</div>}
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        </div>
      </Page>
    </>
  );
}
