"use client";

import { useDemo } from "@/lib/store";
import { Page, PageHeader } from "@/components/staff/Shell";
import { Badge, Button, Card, CardHeader, Select, useToast } from "@/components/ui";
import { fmtDateTime } from "@/lib/format";
import { BatteryMedium, KeyRound } from "lucide-react";

export default function LockboxesPage() {
  const demo = useDemo();
  const toast = useToast();
  const now = demo.now();

  return (
    <>
      <PageHeader
        title="Lockboxes"
        subtitle="One-time codes for self-guided tours. Codes are programmed into each box in advance; the app hands them out one at a time."
        action={<Button variant="secondary">Add lockbox</Button>}
      />
      <Page>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {demo.lockboxes.map((b) => {
            const listing = b.listingId ? demo.listings.find((l) => l.id === b.listingId) : undefined;
            const property = listing ? demo.properties.find((p) => p.id === listing.propertyId) : undefined;
            const remaining = b.codePool.filter((c) => !b.usedCodes.includes(c));
            const uses = demo.showings.filter((s) => s.accessCode && listing && s.listingId === listing.id).sort((a, b2) => (b2.codeReleasedAt ?? "").localeCompare(a.codeReleasedAt ?? ""));
            const low = remaining.length <= 1;
            return (
              <Card key={b.id}>
                <CardHeader
                  title={
                    <span className="flex items-center gap-2">
                      <KeyRound size={15} /> {b.label} <span className="font-mono text-[12px] text-ash font-normal">{b.serial}</span>
                    </span>
                  }
                  action={low ? <Badge tone="red">Reprogram</Badge> : b.listingId ? <Badge tone="green">In use</Badge> : <Badge>Spare</Badge>}
                />
                <div className="px-5 pb-5">
                  <div className="text-[13px] text-ink-3 mb-2">Assigned to</div>
                  <Select
                    value={b.listingId ?? ""}
                    onChange={(e) => {
                      demo.updateLockbox(b.id, { listingId: e.target.value || undefined });
                      if (b.listingId) demo.updateListing(b.listingId, { lockboxId: undefined });
                      if (e.target.value) demo.updateListing(e.target.value, { lockboxId: b.id });
                      toast.show("Lockbox reassigned");
                    }}
                  >
                    <option value="">Not assigned</option>
                    {demo.listings
                      .filter((l) => l.status !== "ARCHIVED")
                      .map((l) => (
                        <option key={l.id} value={l.id}>
                          {demo.properties.find((p) => p.id === l.propertyId)!.name} · {l.unitLabel}
                        </option>
                      ))}
                  </Select>
                  <div className="mt-2 text-[13px] text-ink-3">{b.location}</div>

                  <div className="mt-4 flex items-center justify-between text-[12.5px]">
                    <span className="text-ash">Codes remaining</span>
                    <span className={`font-bold tabular ${low ? "text-strike" : "text-ink"}`}>
                      {remaining.length} of {b.codePool.length}
                    </span>
                  </div>
                  <div className="mt-1.5 flex gap-1">
                    {b.codePool.map((c) => (
                      <span key={c} className={`h-1.5 flex-1 rounded-full ${b.usedCodes.includes(c) ? "bg-line" : "bg-leaf"}`} title={b.usedCodes.includes(c) ? `${c} used` : "unused"} />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[12.5px] text-ash">
                    <BatteryMedium size={14} /> {b.battery}% · installed {fmtDateTime(b.installedAt).split(",")[0]}
                  </div>

                  {uses.length > 0 && (
                    <div className="mt-4 border-t border-line-soft pt-3">
                      <div className="text-[11.5px] font-bold uppercase tracking-wider text-ash mb-1.5">Recent access</div>
                      <ul className="space-y-1.5 text-[12.5px]">
                        {uses.slice(0, 3).map((s) => {
                          const lead = demo.leads.find((l) => l.id === s.leadId)!;
                          const active = s.checkedInAt && !s.checkedOutAt;
                          return (
                            <li key={s.id} className="flex items-center justify-between">
                              <span className="text-ink-2">
                                {lead.firstName} {lead.lastName} · <span className="font-mono">{s.accessCode}</span>
                              </span>
                              <span className={active ? "text-leaf font-bold" : "text-ash"}>{active ? "inside now" : s.checkedOutAt ? "returned" : s.status === "NO_SHOW" ? "unused" : "released"}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {property && (
                    <div className="mt-3 text-[12px] text-smoke">
                      {property.name}, {property.address}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        <p className="mt-5 text-[12.5px] text-ash max-w-2xl">Hardware note: this works with any keypad lockbox. When Matchbox chooses a connected box (igloohome, CodeBox, or SentriLock), codes are generated per tour instead of pre-programmed, and the code pool goes away. Nothing about the renter's experience changes. Demo clock: {fmtDateTime(now.toISOString())}.</p>
      </Page>
      {toast.node}
    </>
  );
}
