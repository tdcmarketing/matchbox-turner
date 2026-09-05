"use client";

import { useState } from "react";
import { useDemo } from "@/lib/store";
import { Page, PageHeader } from "@/components/staff/Shell";
import { Avatar, Button, Card, Input, Select, Table, Td, Th } from "@/components/ui";
import { LeadLink, LeadStatusBadge, leadStatusMeta, sourceLabel } from "@/components/staff/bits";
import { fmtAgo } from "@/lib/format";
import type { LeadStatus } from "@/lib/data/types";
import { cn } from "@/lib/cn";

const pipeline: LeadStatus[] = ["NEW", "QUALIFIED", "SCHEDULED", "TOURED", "APPLIED", "LEASED"];

export default function LeadsPage() {
  const demo = useDemo();
  const now = demo.now();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | LeadStatus>("ALL");
  const [view, setView] = useState<"table" | "board">("table");

  const rows = demo.leads
    .filter((l) => status === "ALL" || l.status === status)
    .filter((l) => !q || `${l.firstName} ${l.lastName} ${l.email} ${l.phone}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle={`${demo.leads.length} total · ${demo.leads.filter((l) => l.status === "NEW").length} new · ${demo.leads.filter((l) => l.status === "WAITLIST").length} on waitlists`}
        action={
          <>
            <div className="inline-flex rounded-md border border-line bg-white p-0.5">
              {(["table", "board"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={cn("px-3 h-8 rounded text-[13px] font-semibold capitalize", view === v ? "bg-ink text-white" : "text-ink-3")}>
                  {v}
                </button>
              ))}
            </div>
            <Button variant="secondary">Add lead</Button>
          </>
        }
      />
      <Page>
        <div className="flex gap-2 mb-4">
          <Input placeholder="Search name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <Select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus | "ALL")} className="max-w-[200px]">
            <option value="ALL">All statuses</option>
            {(Object.keys(leadStatusMeta) as LeadStatus[]).map((s) => (
              <option key={s} value={s}>
                {leadStatusMeta[s].label}
              </option>
            ))}
          </Select>
        </div>

        {view === "table" ? (
          <Card>
            <Table>
              <thead>
                <tr>
                  <Th>Lead</Th>
                  <Th>Home</Th>
                  <Th>Source</Th>
                  <Th>Status</Th>
                  <Th>Rent Manager</Th>
                  <Th className="text-right">Came in</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => {
                  const listing = demo.listings.find((x) => x.id === l.listingId)!;
                  const property = demo.properties.find((p) => p.id === listing.propertyId)!;
                  return (
                    <tr key={l.id} className="hover:bg-paper-2">
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar initials={`${l.firstName[0]}${l.lastName[0]}`} size={30} />
                          <div>
                            <LeadLink id={l.id}>
                              {l.firstName} {l.lastName}
                            </LeadLink>
                            <div className="text-[12.5px] text-ash">{l.phone}</div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <div className="font-medium text-ink">{property.name}</div>
                        <div className="text-[12.5px] text-ash">{listing.unitLabel}</div>
                      </Td>
                      <Td className="text-ink-3">{sourceLabel[l.source]}</Td>
                      <Td>
                        <LeadStatusBadge status={l.status} />
                      </Td>
                      <Td className="text-[12.5px] tabular">{l.rmProspectId ? <span className="text-ink-3">Prospect #{l.rmProspectId}</span> : <span className="text-smoke">Not pushed</span>}</Td>
                      <Td className="text-right text-ink-3 whitespace-nowrap">{fmtAgo(l.createdAt, now)}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>
        ) : (
          <div className="grid grid-cols-6 gap-3 min-w-[960px]">
            {pipeline.map((s) => {
              const col = rows.filter((l) => l.status === s);
              return (
                <div key={s} className="bg-paper rounded-lg p-2.5 min-h-[320px]">
                  <div className="flex items-center justify-between px-1.5 pb-2">
                    <div className="text-[12px] font-bold uppercase tracking-wider text-ink-3">{leadStatusMeta[s].label}</div>
                    <div className="text-[12px] tabular text-ash">{col.length}</div>
                  </div>
                  <div className="space-y-2">
                    {col.map((l) => {
                      const listing = demo.listings.find((x) => x.id === l.listingId)!;
                      return (
                        <div key={l.id} className="bg-white rounded-md border border-line-soft shadow-card p-3">
                          <LeadLink id={l.id}>
                            {l.firstName} {l.lastName}
                          </LeadLink>
                          <div className="text-[12.5px] text-ash mt-0.5">{listing.unitLabel}</div>
                          <div className="text-[11.5px] text-smoke mt-1">{sourceLabel[l.source]} · {fmtAgo(l.createdAt, now)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Page>
    </>
  );
}
