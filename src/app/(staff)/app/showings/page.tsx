"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/lib/store";
import { Page, PageHeader } from "@/components/staff/Shell";
import { Avatar, Button, Card, Select, Table, Td, Th } from "@/components/ui";
import { LeadLink, ListingLink, ShowingStatusBadge, showingStatusMeta } from "@/components/staff/bits";
import { fmtDateTime, fmtRelativeDay, fmtTime } from "@/lib/format";
import type { ShowingStatus } from "@/lib/data/types";
import { KeyRound } from "lucide-react";

export default function ShowingsPage() {
  const demo = useDemo();
  const now = demo.now();
  const [range, setRange] = useState<"upcoming" | "past" | "all">("upcoming");
  const [status, setStatus] = useState<"ALL" | ShowingStatus>("ALL");

  const rows = demo.showings
    .filter((s) => (range === "all" ? true : range === "upcoming" ? new Date(s.endsAt) >= now : new Date(s.endsAt) < now))
    .filter((s) => status === "ALL" || s.status === status)
    .sort((a, b) => (range === "past" ? b.startsAt.localeCompare(a.startsAt) : a.startsAt.localeCompare(b.startsAt)));

  return (
    <>
      <PageHeader title="Tours" subtitle="Every guided and self-guided tour, with what happened" />
      <Page>
        <div className="flex gap-2 mb-4">
          <Select value={range} onChange={(e) => setRange(e.target.value as typeof range)} className="max-w-[160px]">
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="all">All</option>
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value as ShowingStatus | "ALL")} className="max-w-[180px]">
            <option value="ALL">All statuses</option>
            {(Object.keys(showingStatusMeta) as ShowingStatus[]).map((s) => (
              <option key={s} value={s}>
                {showingStatusMeta[s].label}
              </option>
            ))}
          </Select>
        </div>
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Lead</Th>
                <Th>Home</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Access</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const lead = demo.leads.find((l) => l.id === s.leadId)!;
                const listing = demo.listings.find((l) => l.id === s.listingId)!;
                const property = demo.properties.find((p) => p.id === listing.propertyId)!;
                const agent = s.agentId ? demo.agents.find((a) => a.id === s.agentId) : undefined;
                const past = new Date(s.endsAt) < now;
                return (
                  <tr key={s.id} className="hover:bg-paper-2">
                    <Td>
                      <div className="font-semibold text-ink whitespace-nowrap">{fmtRelativeDay(s.startsAt, now)}</div>
                      <div className="text-[12.5px] text-ash tabular">{fmtTime(s.startsAt)}</div>
                    </Td>
                    <Td>
                      <LeadLink id={lead.id}>
                        {lead.firstName} {lead.lastName}
                      </LeadLink>
                      <div className="text-[12.5px] text-ash">{lead.phone}</div>
                    </Td>
                    <Td>
                      <ListingLink id={listing.id}>{property.name}</ListingLink>
                      <div className="text-[12.5px] text-ash">{listing.unitLabel}</div>
                    </Td>
                    <Td>
                      {agent ? (
                        <span className="inline-flex items-center gap-2 text-ink-2">
                          <Avatar initials={agent.initials} color={agent.color} size={22} /> {agent.name.split(" ")[0]}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-ink-2">
                          <span className="size-[22px] rounded-full bg-ink text-white inline-flex items-center justify-center">
                            <KeyRound size={11} />
                          </span>
                          Self-guided
                        </span>
                      )}
                    </Td>
                    <Td>
                      <ShowingStatusBadge status={s.status} />
                    </Td>
                    <Td className="text-[12.5px] text-ink-3">
                      {s.type === "SELF" ? (
                        s.accessCode ? (
                          <span>
                            Code <span className="font-mono font-semibold text-ink">{s.accessCode}</span>
                            {s.checkedInAt && <span> · in {fmtTime(s.checkedInAt)}</span>}
                            {s.checkedOutAt && <span> · out {fmtTime(s.checkedOutAt)}</span>}
                          </span>
                        ) : (
                          <span className="text-smoke">Releases {fmtTime(new Date(new Date(s.startsAt).getTime() - demo.settings.codeReleaseMinutes * 60000).toISOString())}</span>
                        )
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      {s.status === "REQUESTED" && !past && (
                        <Button size="sm" variant="secondary" onClick={() => demo.confirmShowing(s.id)}>
                          Confirm
                        </Button>
                      )}
                      {s.status === "CONFIRMED" && past && (
                        <span className="inline-flex gap-1">
                          <Button size="sm" variant="secondary" onClick={() => demo.markShowing(s.id, "COMPLETED")}>
                            Showed
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => demo.markShowing(s.id, "NO_SHOW")}>
                            No-show
                          </Button>
                        </span>
                      )}
                      {s.status === "CONFIRMED" && !past && (
                        <Link href={`/tour/?id=${s.id}`} className="text-[13px] font-semibold text-strike">
                          Renter view
                        </Link>
                      )}
                      {s.feedback && <span className="text-strike font-bold">{"★".repeat(s.feedback.rating)}</span>}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
        <p className="mt-3 text-[12.5px] text-ash">Next confirmation sweep: {fmtDateTime(new Date(now.getTime() + 15 * 60000).toISOString())}. Unconfirmed tours inside {demo.settings.confirmDeadlineHours} hours are released automatically.</p>
      </Page>
    </>
  );
}
