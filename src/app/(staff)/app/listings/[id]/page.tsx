"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import { useDemo } from "@/lib/store";
import { Page, PageHeader } from "@/components/staff/Shell";
import { Avatar, Badge, Button, Card, CardHeader, Field, Input, Select, Textarea, Toggle, useToast } from "@/components/ui";
import { LeadLink, LeadStatusBadge, ShowingStatusBadge } from "@/components/staff/bits";
import { fmtAgo, fmtDateTime, money } from "@/lib/format";
import type { ListingStatus, ShowingMode } from "@/lib/data/types";
import { ExternalLink } from "lucide-react";

export default function ListingAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ListingAdmin id={id} />;
}

function ListingAdmin({ id }: { id: string }) {
  const demo = useDemo();
  const toast = useToast();
  const listing = demo.listings.find((l) => l.id === id);
  const [draft, setDraft] = useState(listing);
  if (!listing || !draft) return <Page>Listing not found.</Page>;
  const property = demo.properties.find((p) => p.id === listing.propertyId)!;
  const now = demo.now();
  const leads = demo.leads.filter((l) => l.listingId === listing.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const showings = demo.showings.filter((s) => s.listingId === listing.id).sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const lockbox = demo.lockboxes.find((b) => b.id === listing.lockboxId);

  const save = () => {
    demo.updateListing(listing.id, draft);
    toast.show("Listing saved");
  };

  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/app/listings" className="hover:underline">
            Listings
          </Link>
        }
        title={`${property.name} · ${listing.unitLabel}`}
        subtitle={
          <span className="flex items-center gap-3">
            <span>{property.address}</span>
            {listing.rmUnitId && <span className="text-smoke">Rent Manager unit #{listing.rmUnitId}</span>}
            <Link href={`/listings/${listing.slug}`} className="inline-flex items-center gap-1 text-strike font-semibold">
              Renter view <ExternalLink size={12} />
            </Link>
          </span>
        }
        action={
          <>
            <Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as ListingStatus })} className="w-[150px]">
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">On market</option>
              <option value="PAUSED">Paused</option>
              <option value="LEASED">Leased</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
            <Button onClick={save}>Save</Button>
          </>
        }
      />
      <Page>
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            {listing.status === "DRAFT" && listing.source === "RENT_MANAGER" && (
              <div className="rounded-lg bg-amber-soft border border-amber/30 p-4 text-[14px] text-ink-2">
                <span className="font-bold text-ink">Imported from Rent Manager.</span> Rent, size, and availability came from RM. Add a headline, description, photos, and pick a tour mode, then set it to On market.
              </div>
            )}
            <Card>
              <CardHeader title="Details" subtitle="Rent, size, and availability mirror Rent Manager. Edit copy and photos here." />
              <div className="px-5 pb-5 grid gap-4">
                <Field label="Headline">
                  <Input value={draft.headline} onChange={(e) => setDraft({ ...draft, headline: e.target.value })} placeholder="Corner two-bedroom with mountain views" />
                </Field>
                <Field label="Description">
                  <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="min-h-32" />
                </Field>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Field label="Rent / unit">
                    <Input type="number" value={draft.rent} onChange={(e) => setDraft({ ...draft, rent: Number(e.target.value) })} />
                  </Field>
                  <Field label="Rent / bed">
                    <Input type="number" value={draft.rentPerBed ?? ""} onChange={(e) => setDraft({ ...draft, rentPerBed: e.target.value ? Number(e.target.value) : undefined })} placeholder="Student only" />
                  </Field>
                  <Field label="Deposit">
                    <Input type="number" value={draft.deposit} onChange={(e) => setDraft({ ...draft, deposit: Number(e.target.value) })} />
                  </Field>
                  <Field label="Available">
                    <Input type="date" value={draft.availableOn} onChange={(e) => setDraft({ ...draft, availableOn: e.target.value })} />
                  </Field>
                </div>
                <Field label="Amenities" hint="One per line">
                  <Textarea value={draft.amenities.join("\n")} onChange={(e) => setDraft({ ...draft, amenities: e.target.value.split("\n").filter(Boolean) })} />
                </Field>
                <div>
                  <div className="text-[13px] font-semibold text-ink-2 mb-1.5">Photos</div>
                  <div className="flex gap-2 flex-wrap">
                    {draft.photos.map((p) => (
                      <span key={p} className="relative size-24 rounded-md overflow-hidden bg-paper">
                        <Image src={p} alt="" fill sizes="96px" className="object-cover" />
                      </span>
                    ))}
                    <button type="button" className="size-24 rounded-md border-2 border-dashed border-line text-ash text-[12.5px] font-semibold hover:border-ink-3 hover:text-ink">
                      + Add photos
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Tours" subtitle="Who can tour, how, and when" />
              <div className="px-5 pb-5 grid gap-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Tour mode">
                    <Select value={draft.showingMode} onChange={(e) => setDraft({ ...draft, showingMode: e.target.value as ShowingMode })}>
                      <option value="AGENT">Guided only</option>
                      <option value="SELF">Self-guided only</option>
                      <option value="BOTH">Guided or self-guided</option>
                      <option value="NONE">No tours (waitlist)</option>
                    </Select>
                  </Field>
                  <Field label="Pre-qualification questions">
                    <Select value={draft.prequalSetId} onChange={(e) => setDraft({ ...draft, prequalSetId: e.target.value })}>
                      {demo.prequalSets.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.name} ({q.questions.length})
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-ink-2 mb-1.5">Leasing agents who show this home</div>
                  <div className="flex flex-wrap gap-2">
                    {demo.agents.map((a) => {
                      const on = draft.agentIds.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setDraft({ ...draft, agentIds: on ? draft.agentIds.filter((x) => x !== a.id) : [...draft.agentIds, a.id] })}
                          className={`inline-flex items-center gap-2 rounded-full border pl-1 pr-3 py-1 text-[13px] font-semibold ${on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2"}`}
                        >
                          <Avatar initials={a.initials} color={a.color} size={22} /> {a.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {(draft.showingMode === "SELF" || draft.showingMode === "BOTH") && (
                  <Field label="Lockbox">
                    <Select value={draft.lockboxId ?? ""} onChange={(e) => setDraft({ ...draft, lockboxId: e.target.value || undefined })}>
                      <option value="">Not assigned</option>
                      {demo.lockboxes
                        .filter((b) => !b.listingId || b.listingId === listing.id)
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.label} · {b.serial} · {b.location}
                          </option>
                        ))}
                    </Select>
                  </Field>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader title="Syndication" subtitle="Posted through Rent Manager's ILS feed" />
              <div className="px-5 pb-5 space-y-3">
                <Toggle checked={draft.syndicate} onChange={(v) => setDraft({ ...draft, syndicate: v })} label="Post to listing sites" />
                <ul className="text-[13.5px] space-y-1.5">
                  {["Zillow", "Apartments.com", "Zumper", "Apartment List", "Rent.com"].map((s) => (
                    <li key={s} className="flex items-center justify-between">
                      <span className="text-ink-2">{s}</span>
                      {draft.syndicate && listing.status === "ACTIVE" ? <Badge tone="green">Live</Badge> : <Badge>Off</Badge>}
                    </li>
                  ))}
                </ul>
                <p className="text-[12.5px] text-ash">Leads from these sites land in Matchbox Turner with the source recorded.</p>
              </div>
            </Card>

            <Card>
              <CardHeader title="Performance" subtitle="Last 30 days" />
              <dl className="px-5 pb-5 grid grid-cols-3 gap-3 text-center">
                {[
                  ["Views", listing.views],
                  ["Leads", leads.length],
                  ["Tours", showings.filter((s) => !["CANCELLED", "UNCONFIRMED_CANCELLED"].includes(s.status)).length],
                ].map(([k, v]) => (
                  <div key={k as string} className="rounded-md bg-paper py-3">
                    <dd className="text-xl font-extrabold tabular text-ink">{v}</dd>
                    <dt className="text-[11.5px] font-bold uppercase tracking-wider text-ash">{k}</dt>
                  </div>
                ))}
              </dl>
            </Card>

            {lockbox && (
              <Card>
                <CardHeader title="Lockbox" />
                <div className="px-5 pb-5 text-[13.5px]">
                  <div className="font-semibold text-ink">
                    {lockbox.label} · {lockbox.serial}
                  </div>
                  <div className="text-ink-3">{lockbox.location}</div>
                  <div className="mt-2 text-ash">
                    {lockbox.codePool.length - lockbox.usedCodes.length} unused codes · battery {lockbox.battery}%
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <CardHeader title="Recent leads" />
              <ul className="divide-y divide-line-soft">
                {leads.slice(0, 5).map((l) => (
                  <li key={l.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <LeadLink id={l.id}>
                        {l.firstName} {l.lastName}
                      </LeadLink>
                      <div className="text-[12px] text-ash">{fmtAgo(l.createdAt, now)}</div>
                    </div>
                    <LeadStatusBadge status={l.status} />
                  </li>
                ))}
                {leads.length === 0 && <li className="px-5 py-4 text-[13.5px] text-ash">No leads yet.</li>}
              </ul>
            </Card>

            <Card>
              <CardHeader title="Recent tours" />
              <ul className="divide-y divide-line-soft">
                {showings.slice(0, 5).map((s) => {
                  const lead = demo.leads.find((l) => l.id === s.leadId)!;
                  return (
                    <li key={s.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-ink text-[13.5px]">{fmtDateTime(s.startsAt)}</div>
                        <div className="text-[12px] text-ash">
                          {lead.firstName} {lead.lastName}
                        </div>
                      </div>
                      <ShowingStatusBadge status={s.status} />
                    </li>
                  );
                })}
                {showings.length === 0 && <li className="px-5 py-4 text-[13.5px] text-ash">No tours yet.</li>}
              </ul>
            </Card>
            <div className="text-[12.5px] text-ash px-1">Deposit {money(listing.deposit)} · {listing.leaseTermMonths}-month lease</div>
          </div>
        </div>
      </Page>
      {toast.node}
    </>
  );
}
