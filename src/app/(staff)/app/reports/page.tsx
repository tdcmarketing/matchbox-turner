"use client";

import { useDemo } from "@/lib/store";
import { Page, PageHeader } from "@/components/staff/Shell";
import { Button, Card, CardHeader, Stat } from "@/components/ui";
import { sourceLabel } from "@/components/staff/bits";
import type { LeadSource } from "@/lib/data/types";

export default function ReportsPage() {
  const demo = useDemo();
  const funnel = [
    ["Leads", demo.leads.length],
    ["Qualified", demo.leads.filter((l) => !["NEW", "DISQUALIFIED", "WAITLIST", "LOST"].includes(l.status)).length],
    ["Booked a tour", demo.leads.filter((l) => ["SCHEDULED", "TOURED", "APPLIED", "LEASED"].includes(l.status)).length],
    ["Toured", demo.leads.filter((l) => ["TOURED", "APPLIED", "LEASED"].includes(l.status)).length],
    ["Applied", demo.leads.filter((l) => ["APPLIED", "LEASED"].includes(l.status)).length],
    ["Leased", demo.leads.filter((l) => l.status === "LEASED").length],
  ] as const;
  const max = funnel[0][1] || 1;

  const bySource = (Object.keys(sourceLabel) as LeadSource[])
    .map((s) => ({ s, n: demo.leads.filter((l) => l.source === s).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const srcMax = bySource[0]?.n || 1;

  const tours = demo.showings.filter((s) => s.status !== "CANCELLED");
  const completed = tours.filter((s) => s.status === "COMPLETED").length;
  const noShow = tours.filter((s) => s.status === "NO_SHOW").length;
  const released = tours.filter((s) => s.status === "UNCONFIRMED_CANCELLED").length;
  const self = tours.filter((s) => s.type === "SELF").length;

  const byListing = demo.listings
    .filter((l) => l.status === "ACTIVE" || l.status === "LEASED")
    .map((l) => ({
      l,
      p: demo.properties.find((p) => p.id === l.propertyId)!,
      leads: demo.leads.filter((x) => x.listingId === l.id).length,
      tours: demo.showings.filter((s) => s.listingId === l.id && !["CANCELLED", "UNCONFIRMED_CANCELLED"].includes(s.status)).length,
      days: Math.max(0, Math.round((demo.now().getTime() - new Date(l.createdAt).getTime()) / 86400000)),
    }))
    .sort((a, b) => b.leads - a.leads);

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Lead-to-lease, by source and by home. Owner reports go out the first of the month."
        action={
          <>
            <Button variant="secondary">Export CSV</Button>
            <Button variant="secondary">Preview owner report</Button>
          </>
        }
      />
      <Page>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Tours completed" value={completed} delta={`${self} self-guided`} />
          <Stat label="No-show rate" value={`${Math.round((noShow / Math.max(1, completed + noShow)) * 100)}%`} delta="industry avg 25–40%" tone="good" />
          <Stat label="Released unconfirmed" value={released} delta="slots given back" />
          <Stat label="Avg. days to first tour" value="1.6" delta="from lead created" tone="good" />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader title="Lead to lease" subtitle="All leads, all time in the demo" />
            <ol className="px-5 pb-5 space-y-2.5">
              {funnel.map(([label, n], i) => (
                <li key={label} className="grid grid-cols-[120px_1fr_48px] items-center gap-3 text-[13.5px]">
                  <span className="text-ink-2 font-medium">{label}</span>
                  <span className="h-6 rounded bg-paper overflow-hidden">
                    <span className="block h-full rounded" style={{ width: `${Math.max(3, (n / max) * 100)}%`, background: i === 0 ? "var(--ink)" : i === funnel.length - 1 ? "var(--strike)" : "var(--ink-3)", opacity: i === 0 || i === funnel.length - 1 ? 1 : 1 - i * 0.12 }} />
                  </span>
                  <span className="text-right tabular font-bold text-ink">{n}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <CardHeader title="Where leads come from" />
            <ol className="px-5 pb-5 space-y-2.5">
              {bySource.map(({ s, n }) => (
                <li key={s} className="grid grid-cols-[150px_1fr_48px] items-center gap-3 text-[13.5px]">
                  <span className="text-ink-2 font-medium">{sourceLabel[s]}</span>
                  <span className="h-6 rounded bg-paper overflow-hidden">
                    <span className="block h-full rounded bg-sky" style={{ width: `${(n / srcMax) * 100}%` }} />
                  </span>
                  <span className="text-right tabular font-bold text-ink">{n}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <Card className="mt-5">
          <CardHeader title="By home" subtitle="Which listings pull, and which are sitting" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11.5px] font-bold uppercase tracking-wider text-ash">
                  <th className="px-5 py-2.5 border-b border-line-soft">Home</th>
                  <th className="px-4 py-2.5 border-b border-line-soft">Days listed</th>
                  <th className="px-4 py-2.5 border-b border-line-soft">Views</th>
                  <th className="px-4 py-2.5 border-b border-line-soft">Leads</th>
                  <th className="px-4 py-2.5 border-b border-line-soft">Tours</th>
                  <th className="px-4 py-2.5 border-b border-line-soft">Lead → tour</th>
                  <th className="px-4 py-2.5 border-b border-line-soft">Status</th>
                </tr>
              </thead>
              <tbody>
                {byListing.map(({ l, p, leads, tours, days }) => (
                  <tr key={l.id} className="hover:bg-paper-2">
                    <td className="px-5 py-3 border-b border-line-soft">
                      <div className="font-semibold text-ink">{p.name}</div>
                      <div className="text-[12.5px] text-ash">{l.unitLabel}</div>
                    </td>
                    <td className="px-4 py-3 border-b border-line-soft tabular text-ink-2">{days}</td>
                    <td className="px-4 py-3 border-b border-line-soft tabular text-ink-2">{l.views}</td>
                    <td className="px-4 py-3 border-b border-line-soft tabular text-ink-2">{leads}</td>
                    <td className="px-4 py-3 border-b border-line-soft tabular text-ink-2">{tours}</td>
                    <td className="px-4 py-3 border-b border-line-soft tabular text-ink-2">{leads ? `${Math.round((tours / leads) * 100)}%` : "—"}</td>
                    <td className="px-4 py-3 border-b border-line-soft text-[12.5px] text-ink-3">{l.status === "LEASED" ? "Leased" : days > 14 && leads < 2 ? <span className="text-strike font-semibold">Needs attention</span> : "Healthy"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Page>
    </>
  );
}
