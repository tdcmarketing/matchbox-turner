"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDemo } from "@/lib/store";
import { Hydrated } from "@/components/Hydrated";
import { rmUnitsFixture } from "@/lib/data/seed";
import { fmtDateTime, money } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Lead, LeadStatus } from "@/lib/data/types";

/**
 * Simulated Rent Manager Online window.
 * This is what Matchbox staff would see inside RM after Matchbox Turner writes back:
 * Prospect records, History/Notes entries, and unit availability. Styled to read as
 * a different product on purpose.
 */

const rmStatus: Record<LeadStatus, string> = {
  NEW: "Prospect",
  QUALIFIED: "Prospect",
  DISQUALIFIED: "Prospect - Declined",
  WAITLIST: "Prospect - Waitlist",
  SCHEDULED: "Prospect - Showing",
  TOURED: "Prospect - Showed",
  APPLIED: "Applicant",
  LEASED: "Tenant",
  LOST: "Prospect - Lost",
};

type Tab = "Prospects" | "Units" | "History";

export default function RmPage() {
  return (
    <Hydrated fallback={<div className="min-h-screen bg-[#e9ecf0]" />}>
      <RmWindow />
    </Hydrated>
  );
}

function RmWindow() {
  const demo = useDemo();
  const [tab, setTab] = useState<Tab>("Prospects");
  const prospects = demo.leads.filter((l) => l.rmProspectId).sort((a, b) => (b.rmProspectId ?? 0) - (a.rmProspectId ?? 0));
  const [selectedId, setSelectedId] = useState<string | null>(prospects[0]?.id ?? null);
  const selected = prospects.find((p) => p.id === selectedId) ?? prospects[0];
  const now = demo.now();

  return (
    <div className="min-h-[calc(100vh-2.5rem)] bg-[#e9ecf0] text-[#1f2933] font-[system-ui,'Segoe_UI',Roboto,sans-serif] text-[13px]">
      {/* Sandbox banner */}
      <div className="bg-[#fff4d6] border-b border-[#e6c97a] text-[#6b5314] text-[12px] px-4 py-1.5 flex items-center justify-between">
        <span>
          <strong>Simulated Rent Manager.</strong> This mirrors what Matchbox staff would see inside RM after Matchbox Turner writes back. Not connected to a real RM database.
        </span>
        <Link href="/app/settings/rent-manager" className="font-semibold underline">
          Back to Matchbox Turner
        </Link>
      </div>

      {/* RM chrome */}
      <div className="bg-[#2b4c7e] text-white px-4 h-11 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-6 items-center justify-center rounded-sm bg-white text-[#2b4c7e] font-black text-[11px]">RM</span>
          <span className="font-semibold">Rent Manager Online</span>
          <span className="text-white/60">· Matchbox Realty &amp; Management Services</span>
        </div>
        <div className="text-white/70 text-[12px]">Database: MATCHBOX · User: bwalters · {fmtDateTime(now.toISOString())}</div>
      </div>
      <div className="bg-[#f5f7fa] border-b border-[#c9d1dc] px-4 flex items-center gap-1 h-9">
        {(["Prospects", "Units", "History"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-3 h-7 rounded-sm text-[12.5px]", tab === t ? "bg-white border border-[#c9d1dc] font-semibold" : "text-[#4a5568] hover:bg-white/70")}>
            {t}
          </button>
        ))}
        <span className="ml-auto text-[11.5px] text-[#6b7280]">API user “turner” · last write {demo.messages[0] ? fmtDateTime(demo.messages[0].at) : "—"}</span>
      </div>

      <div className="p-4">
        {tab === "Prospects" && (
          <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
            <Grid
              title={`Prospects (${prospects.length})`}
              columns={["ProspectID", "Name", "Phone", "Email", "Status", "Source", "Desired Unit", "Move-In", "Created By"]}
              rows={prospects.map((p) => {
                const listing = demo.listings.find((l) => l.id === p.listingId)!;
                const property = demo.properties.find((x) => x.id === listing.propertyId)!;
                return {
                  id: p.id,
                  cells: [
                    String(p.rmProspectId),
                    `${p.lastName}, ${p.firstName}`,
                    p.phone,
                    p.email,
                    rmStatus[p.status],
                    p.source === "WEB" ? "Website" : p.source === "APARTMENTS" ? "Apartments.com" : p.source.charAt(0) + p.source.slice(1).toLowerCase().replace("_", " "),
                    `${property.name} ${listing.unitLabel}`,
                    p.moveInDate ?? "",
                    "Matchbox Turner",
                  ],
                };
              })}
              selectedId={selected?.id}
              onSelect={setSelectedId}
            />
            {selected && <ProspectPanel lead={selected} />}
          </div>
        )}

        {tab === "Units" && <UnitsGrid />}

        {tab === "History" && <HistoryGrid />}
      </div>
    </div>
  );
}

function Grid({ title, columns, rows, selectedId, onSelect }: { title: string; columns: string[]; rows: { id: string; cells: string[] }[]; selectedId?: string; onSelect?: (id: string) => void }) {
  return (
    <div className="bg-white border border-[#c9d1dc] rounded-sm overflow-hidden">
      <div className="px-3 h-8 flex items-center bg-[#f5f7fa] border-b border-[#c9d1dc] font-semibold text-[12.5px]">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px] border-collapse">
          <thead>
            <tr className="bg-[#eef1f5]">
              {columns.map((c) => (
                <th key={c} className="text-left font-semibold px-2.5 py-1.5 border-b border-r border-[#d9dfe7] whitespace-nowrap last:border-r-0">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} onClick={() => onSelect?.(r.id)} className={cn("cursor-default", r.id === selectedId ? "bg-[#cfe0f7]" : i % 2 ? "bg-[#fafbfc]" : "bg-white", onSelect && "hover:bg-[#e3edfa]")}>
                {r.cells.map((c, j) => (
                  <td key={j} className="px-2.5 py-1.5 border-b border-r border-[#e6eaf0] whitespace-nowrap last:border-r-0">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-[#6b7280]">
                  No records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function useHistoryFor(leadId?: string) {
  const demo = useDemo();
  return useMemo(() => {
    const entries: { at: string; leadId: string; category: string; note: string; user: string }[] = [];
    const leads = demo.leads.filter((l) => l.rmProspectId && (!leadId || l.id === leadId));
    for (const l of leads) {
      const listing = demo.listings.find((x) => x.id === l.listingId)!;
      const property = demo.properties.find((p) => p.id === listing.propertyId)!;
      entries.push({ at: l.createdAt, leadId: l.id, category: "Prospect", note: `Prospect created from ${l.source === "WEB" ? "matchboxrealty.com" : l.source} inquiry on ${property.name} ${listing.unitLabel}. Pre-qualification: ${l.answers.length ? (l.answers.every((a) => a.passed) ? "passed" : "did not pass") : "not started"}.`, user: "turner" });
      for (const s of demo.showings.filter((x) => x.leadId === l.id)) {
        entries.push({ at: s.createdAt, leadId: l.id, category: "Showing", note: `${s.type === "SELF" ? "Self-guided" : "Guided"} showing requested for ${fmtDateTime(s.startsAt)}${s.agentId ? ` with ${demo.agents.find((a) => a.id === s.agentId)?.name}` : ""}.`, user: "turner" });
        if (s.confirmedAt) entries.push({ at: s.confirmedAt, leadId: l.id, category: "Showing", note: "Prospect confirmed showing by text.", user: "turner" });
        if (s.codeReleasedAt) entries.push({ at: s.codeReleasedAt, leadId: l.id, category: "Access", note: `Lockbox code ${s.accessCode} issued for ${listing.unitLabel}.`, user: "turner" });
        if (s.checkedInAt) entries.push({ at: s.checkedInAt, leadId: l.id, category: "Access", note: `Prospect checked in to ${listing.unitLabel}.`, user: "turner" });
        if (s.checkedOutAt) entries.push({ at: s.checkedOutAt, leadId: l.id, category: "Access", note: `Prospect checked out of ${listing.unitLabel}. Key returned.`, user: "turner" });
        if (s.status === "NO_SHOW") entries.push({ at: s.endsAt, leadId: l.id, category: "Showing", note: "No-show. Code expired unused.", user: "turner" });
        if (s.status === "UNCONFIRMED_CANCELLED") entries.push({ at: s.startsAt, leadId: l.id, category: "Showing", note: "Showing released: not confirmed 12 hours before start.", user: "turner" });
        if (s.feedback) entries.push({ at: s.feedback.at, leadId: l.id, category: "Feedback", note: `Tour rated ${s.feedback.rating}/5. ${s.feedback.interested ? "Interested; application link sent." : "Not interested."}${s.feedback.comments ? ` Comment: "${s.feedback.comments}"` : ""}`, user: "turner" });
      }
      for (const m of demo.messages.filter((x) => x.leadId === l.id && x.direction === "OUT")) {
        entries.push({ at: m.at, leadId: l.id, category: m.channel === "SMS" ? "Text" : "Email", note: m.subject ? `${m.subject}` : m.body, user: "turner" });
      }
    }
    return entries.sort((a, b) => b.at.localeCompare(a.at));
  }, [demo.leads, demo.showings, demo.messages, demo.listings, demo.properties, demo.agents, leadId]);
}

function ProspectPanel({ lead }: { lead: Lead }) {
  const demo = useDemo();
  const listing = demo.listings.find((l) => l.id === lead.listingId)!;
  const property = demo.properties.find((p) => p.id === listing.propertyId)!;
  const history = useHistoryFor(lead.id);
  const [panelTab, setPanelTab] = useState<"General" | "History/Notes">("History/Notes");
  return (
    <div className="bg-white border border-[#c9d1dc] rounded-sm overflow-hidden self-start">
      <div className="px-3 h-8 flex items-center bg-[#f5f7fa] border-b border-[#c9d1dc] font-semibold text-[12.5px]">
        Prospect {lead.rmProspectId} · {lead.lastName}, {lead.firstName}
      </div>
      <div className="flex border-b border-[#c9d1dc] bg-[#fafbfc]">
        {(["General", "History/Notes"] as const).map((t) => (
          <button key={t} onClick={() => setPanelTab(t)} className={cn("px-3 h-8 text-[12.5px] border-r border-[#e6eaf0]", panelTab === t ? "bg-white font-semibold" : "text-[#4a5568]")}>
            {t}
            {t === "History/Notes" && <span className="ml-1 text-[#6b7280]">({history.length})</span>}
          </button>
        ))}
      </div>
      {panelTab === "General" ? (
        <dl className="p-3 grid grid-cols-[130px_1fr] gap-y-1.5 text-[12.5px]">
          {[
            ["Status", rmStatus[lead.status]],
            ["Phone", lead.phone],
            ["Email", lead.email],
            ["Source", lead.source === "WEB" ? "Website" : lead.source],
            ["Property", property.name],
            ["Desired Unit", listing.unitLabel],
            ["Move-In Date", lead.moveInDate ?? ""],
            ["Text Opt-In", lead.consentSms ? "Yes" : "No"],
            ["Created", fmtDateTime(lead.createdAt)],
            ["Created By", "turner (API)"],
            ["User Defined", "TurnerLeadID = " + lead.id],
          ].map(([k, v]) => (
            <Fragment2 key={k} k={k} v={v} />
          ))}
        </dl>
      ) : (
        <ul className="max-h-[520px] overflow-y-auto">
          {history.map((h, i) => (
            <li key={i} className="px-3 py-2 border-b border-[#eef1f5] text-[12.5px]">
              <div className="flex items-center justify-between text-[11.5px] text-[#6b7280]">
                <span>
                  <span className="inline-block rounded-sm bg-[#eef1f5] px-1.5 py-0.5 font-semibold text-[#2b4c7e] mr-1.5">{h.category}</span>
                  {h.user}
                </span>
                <span>{fmtDateTime(h.at)}</span>
              </div>
              <div className="mt-0.5 text-[#1f2933]">{h.note}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Fragment2({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-[#6b7280]">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </>
  );
}

function UnitsGrid() {
  const demo = useDemo();
  const rows = rmUnitsFixture.map((u) => {
    const listing = demo.listings.find((l) => l.rmUnitId === u.UnitID);
    return {
      id: String(u.UnitID),
      cells: [
        String(u.UnitID),
        u.PropertyName,
        u.Name,
        u.Bedrooms === 0 ? "Studio" : String(u.Bedrooms),
        String(u.Bathrooms),
        u.SquareFootage.toLocaleString(),
        money(u.MarketRent),
        u.IsVacant ? (u.Comment.toLowerCase().includes("notice") ? "Notice" : "Vacant") : "Occupied",
        u.AvailableDate,
        listing ? (listing.status === "ACTIVE" ? "Marketed" : listing.status === "DRAFT" ? "Draft in Turner" : listing.status.charAt(0) + listing.status.slice(1).toLowerCase()) : "Not in Turner",
        u.Comment,
      ],
    };
  });
  return (
    <div className="space-y-3">
      <Grid title={`Units · Vacant &amp; Notice (${rows.length})`.replace("&amp;", "&")} columns={["UnitID", "Property", "Unit", "BR", "BA", "SqFt", "Market Rent", "Status", "Available", "Turner", "Comment"]} rows={rows} />
      <p className="text-[12px] text-[#6b7280]">Turner reads this list every 15 minutes. Vacant and notice units become draft listings; an Occupied status pulls the listing off the market.</p>
    </div>
  );
}

function HistoryGrid() {
  const demo = useDemo();
  const history = useHistoryFor();
  return (
    <div className="space-y-3">
      <Grid
        title={`History/Notes written by API user “turner” (${history.length})`}
        columns={["Date", "Prospect", "Category", "Note", "User"]}
        rows={history.map((h, i) => {
          const lead = demo.leads.find((l) => l.id === h.leadId)!;
          return { id: `${h.leadId}-${i}`, cells: [fmtDateTime(h.at), `${lead.rmProspectId} · ${lead.lastName}, ${lead.firstName}`, h.category, h.note, h.user] };
        })}
      />
      <p className="text-[12px] text-[#6b7280]">Every Turner event lands on the Prospect's History/Notes so staff never have to open Turner to answer "what happened with this person?"</p>
    </div>
  );
}
