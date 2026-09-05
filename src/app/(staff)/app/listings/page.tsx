"use client";

import Image from "next/image";
import { asset } from "@/lib/asset";
import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/lib/store";
import { Page, PageHeader } from "@/components/staff/Shell";
import { Badge, Button, Card, Field, Input, Modal, Select, Table, Td, Th, useToast } from "@/components/ui";
import { fmtDateShort, money } from "@/lib/format";
import type { ListingStatus } from "@/lib/data/types";
import { KeyRound, UserRound } from "lucide-react";

const statusMeta: Record<ListingStatus, { label: string; tone: "neutral" | "red" | "green" | "amber" | "blue" | "ink" }> = {
  DRAFT: { label: "Draft", tone: "amber" },
  ACTIVE: { label: "On market", tone: "green" },
  PAUSED: { label: "Paused", tone: "neutral" },
  LEASED: { label: "Leased", tone: "ink" },
  ARCHIVED: { label: "Archived", tone: "neutral" },
};

export default function ListingsAdminPage() {
  const demo = useDemo();
  const toast = useToast();
  const [status, setStatus] = useState<"ALL" | ListingStatus>("ALL");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ propertyId: demo.properties[0].id, unitLabel: "", rent: "", beds: "1", baths: "1" });

  const rows = demo.listings.filter((l) => status === "ALL" || l.status === status).sort((a, b) => (a.status === b.status ? a.availableOn.localeCompare(b.availableOn) : a.status === "DRAFT" ? -1 : b.status === "DRAFT" ? 1 : a.status === "ACTIVE" ? -1 : 1));
  const leadsFor = (id: string) => demo.leads.filter((l) => l.listingId === id).length;
  const toursFor = (id: string) => demo.showings.filter((s) => s.listingId === id && !["CANCELLED", "UNCONFIRMED_CANCELLED"].includes(s.status)).length;

  return (
    <>
      <PageHeader
        title="Listings"
        subtitle={`${demo.listings.filter((l) => l.status === "ACTIVE").length} on market · ${demo.listings.filter((l) => l.status === "DRAFT").length} drafts from Rent Manager waiting for review`}
        action={
          <>
            <Button variant="secondary" href="/app/settings/rent-manager">
              Sync from Rent Manager
            </Button>
            <Button onClick={() => setCreating(true)}>New listing</Button>
          </>
        }
      />
      <Page>
        <div className="flex gap-2 mb-4">
          <Select value={status} onChange={(e) => setStatus(e.target.value as ListingStatus | "ALL")} className="max-w-[180px]">
            <option value="ALL">All statuses</option>
            {(Object.keys(statusMeta) as ListingStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusMeta[s].label}
              </option>
            ))}
          </Select>
        </div>
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Home</Th>
                <Th>Rent</Th>
                <Th>Available</Th>
                <Th>Tours</Th>
                <Th>Status</Th>
                <Th>Syndication</Th>
                <Th className="text-right">30 days</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const property = demo.properties.find((p) => p.id === l.propertyId)!;
                return (
                  <tr key={l.id} className="hover:bg-paper-2">
                    <Td>
                      <Link href={`/app/listing/?id=${l.id}`} className="flex items-center gap-3 group">
                        <span className="relative size-11 rounded-md overflow-hidden bg-paper shrink-0">{l.photos[0] && <Image src={asset(l.photos[0])} alt="" fill sizes="44px" className="object-cover" />}</span>
                        <span>
                          <span className="block font-semibold text-ink group-hover:text-strike">
                            {property.name} · {l.unitLabel}
                          </span>
                          <span className="block text-[12.5px] text-ash">
                            {l.beds === 0 ? "Studio" : `${l.beds} bd`} · {l.baths} ba · {l.sqft.toLocaleString()} sq ft{l.rmUnitId ? ` · RM #${l.rmUnitId}` : ""}
                          </span>
                        </span>
                      </Link>
                    </Td>
                    <Td className="tabular font-semibold text-ink">{money(l.rent)}{l.rentPerBed && <span className="block text-[12px] font-normal text-ash">{money(l.rentPerBed)}/bed</span>}</Td>
                    <Td className="text-ink-2">{fmtDateShort(l.availableOn)}</Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5 text-ink-2">
                        {(l.showingMode === "AGENT" || l.showingMode === "BOTH") && <UserRound size={14} className="text-ash" />}
                        {(l.showingMode === "SELF" || l.showingMode === "BOTH") && <KeyRound size={14} className="text-ash" />}
                        {l.showingMode === "NONE" && <span className="text-smoke">Off</span>}
                      </span>
                    </Td>
                    <Td>
                      <Badge tone={statusMeta[l.status].tone} dot>
                        {statusMeta[l.status].label}
                      </Badge>
                    </Td>
                    <Td className="text-[12.5px]">{l.syndicate && l.status === "ACTIVE" ? <span className="text-ink-2">Zillow · Apartments.com · Zumper</span> : <span className="text-smoke">Not posted</span>}</Td>
                    <Td className="text-right tabular text-ink-3 whitespace-nowrap">
                      {l.views} views · {leadsFor(l.id)} leads · {toursFor(l.id)} tours
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      </Page>

      <Modal open={creating} onClose={() => setCreating(false)} title="New listing">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            demo.createListing({ propertyId: form.propertyId, unitLabel: form.unitLabel, rent: Number(form.rent), deposit: Number(form.rent), beds: Number(form.beds), baths: Number(form.baths) });
            setCreating(false);
            toast.show("Draft listing created");
          }}
        >
          <Field label="Property">
            <Select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })}>
              {demo.properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Unit">
            <Input required value={form.unitLabel} onChange={(e) => setForm({ ...form, unitLabel: e.target.value })} placeholder="Unit 4C" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Rent">
              <Input required type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} />
            </Field>
            <Field label="Beds">
              <Input type="number" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} />
            </Field>
            <Field label="Baths">
              <Input type="number" step="0.5" value={form.baths} onChange={(e) => setForm({ ...form, baths: e.target.value })} />
            </Field>
          </div>
          <p className="text-[12.5px] text-ash">Most listings arrive from Rent Manager automatically. Use this for homes managed outside RM.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button type="submit">Create draft</Button>
          </div>
        </form>
      </Modal>
      {toast.node}
    </>
  );
}
