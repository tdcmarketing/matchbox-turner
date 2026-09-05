"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDemo } from "@/lib/store";
import { Page, PageHeader } from "@/components/staff/Shell";
import { Badge, Button, Card, CardHeader, Modal, Select, Textarea, useToast } from "@/components/ui";
import { LeadStatusBadge, ShowingStatusBadge, leadStatusMeta, sourceLabel } from "@/components/staff/bits";
import { SlotPicker } from "@/components/public/SlotPicker";
import { fmtAgo, fmtDateTime, fmtTime } from "@/lib/format";
import type { LeadStatus } from "@/lib/data/types";
import { Check, Mail, MessageSquareText, Phone, X } from "lucide-react";

export default function LeadDetailPage() {
  return (
    <Suspense fallback={null}>
      <LeadDetailPageInner />
    </Suspense>
  );
}

function LeadDetailPageInner() {
  const id = useSearchParams().get("id") ?? "";
  return <LeadDetail id={id} />;
}

function LeadDetail({ id }: { id: string }) {
  const demo = useDemo();
  const toast = useToast();
  const lead = demo.leads.find((l) => l.id === id);
  const [booking, setBooking] = useState(false);
  const [tourType, setTourType] = useState<"AGENT" | "SELF">("AGENT");
  const [note, setNote] = useState("");
  const [sms, setSms] = useState("");
  if (!lead) return <Page>Lead not found.</Page>;
  const listing = demo.listings.find((l) => l.id === lead.listingId)!;
  const property = demo.properties.find((p) => p.id === listing.propertyId)!;
  const qset = demo.prequalSets.find((q) => q.id === listing.prequalSetId)!;
  const now = demo.now();
  const showings = demo.showings.filter((s) => s.leadId === lead.id).sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const msgs = demo.messages.filter((m) => m.leadId === lead.id).sort((a, b) => b.at.localeCompare(a.at));

  type Event = { at: string; kind: "lead" | "msg" | "tour" | "feedback" | "note"; title: string; body?: string; lit?: boolean };
  const events: Event[] = [
    { at: lead.createdAt, kind: "lead" as const, title: `Lead came in via ${sourceLabel[lead.source]}`, body: lead.answers.length ? `Answered ${lead.answers.length} pre-qualification questions` : "No questions answered yet", lit: true },
    ...msgs.map((m): Event => ({ at: m.at, kind: "msg", title: m.direction === "IN" ? `Replied "${m.body}"` : `${m.channel === "SMS" ? "Text" : "Email"} sent${m.templateKey ? ` · ${demo.templates.find((t) => t.key === m.templateKey)?.name ?? m.templateKey}` : ""}`, body: m.direction === "OUT" ? m.body : undefined })),
    ...showings.flatMap((s): Event[] => {
      const list: Event[] = [{ at: s.createdAt, kind: "tour" as const, title: `Requested a ${s.type === "SELF" ? "self-guided" : "guided"} tour for ${fmtDateTime(s.startsAt)}`, lit: true }];
      if (s.confirmedAt) list.push({ at: s.confirmedAt, kind: "tour", title: "Confirmed the tour", lit: true });
      if (s.codeReleasedAt) list.push({ at: s.codeReleasedAt, kind: "tour", title: `Access code ${s.accessCode} released` });
      if (s.checkedInAt) list.push({ at: s.checkedInAt, kind: "tour", title: `Checked in at ${fmtTime(s.checkedInAt)}`, lit: true });
      if (s.checkedOutAt) list.push({ at: s.checkedOutAt, kind: "tour", title: `Checked out at ${fmtTime(s.checkedOutAt)}` });
      if (s.feedback) list.push({ at: s.feedback.at, kind: "feedback", title: `Rated the tour ${s.feedback.rating}/5 · ${s.feedback.interested ? "wants to apply" : "passed"}`, body: s.feedback.comments, lit: true });
      if (s.status === "UNCONFIRMED_CANCELLED") list.push({ at: s.startsAt, kind: "tour", title: "Tour released: never confirmed" });
      return list;
    }),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/app/leads" className="hover:underline">
            Leads
          </Link>
        }
        title={
          <span className="flex items-center gap-3">
            {lead.firstName} {lead.lastName} <LeadStatusBadge status={lead.status} />
          </span>
        }
        subtitle={
          <span className="flex flex-wrap items-center gap-x-4">
            <span className="inline-flex items-center gap-1.5">
              <Phone size={13} /> {lead.phone}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail size={13} /> {lead.email}
            </span>
            <span>via {sourceLabel[lead.source]}</span>
            <span>{fmtAgo(lead.createdAt, now)}</span>
          </span>
        }
        action={
          <>
            <Select value={lead.status} onChange={(e) => demo.updateLead(lead.id, { status: e.target.value as LeadStatus })} className="w-[170px]">
              {(Object.keys(leadStatusMeta) as LeadStatus[]).map((s) => (
                <option key={s} value={s}>
                  {leadStatusMeta[s].label}
                </option>
              ))}
            </Select>
            <Button onClick={() => setBooking(true)}>Book a tour</Button>
          </>
        }
      />
      <Page>
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <Card>
              <CardHeader title="Timeline" subtitle="Everything that happened with this lead, newest first" />
              <ol className="px-5 pb-5 space-y-4">
                {events.map((e, i) => (
                  <li key={i} className={`matchstick ${e.lit ? "is-lit" : ""} ${i === events.length - 1 ? "is-last" : ""}`}>
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="font-semibold text-ink text-[14px]">{e.title}</div>
                      <div className="text-[12px] text-ash whitespace-nowrap tabular">{fmtDateTime(e.at)}</div>
                    </div>
                    {e.body && <div className="mt-0.5 text-[13.5px] text-ink-3 leading-relaxed">{e.body}</div>}
                  </li>
                ))}
              </ol>
            </Card>

            <Card>
              <CardHeader title="Send a text" subtitle="Two-way texting from the leasing desk number" />
              <div className="px-5 pb-5">
                <Textarea placeholder={`Text ${lead.firstName}…`} value={sms} onChange={(e) => setSms(e.target.value)} className="min-h-20" />
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-[12.5px] text-ash">{lead.consentSms ? "Opted in to texts" : "Has not opted in to texts. Email instead."}</div>
                  <Button
                    size="sm"
                    disabled={!sms.trim() || !lead.consentSms}
                    onClick={() => {
                      demo.sendMessage({ leadId: lead.id, channel: "SMS", direction: "OUT", to: lead.phone, body: sms.trim() });
                      setSms("");
                      toast.show(`Text sent to ${lead.firstName}`);
                    }}
                  >
                    <MessageSquareText size={14} /> Send
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader title="Interested in" />
              <div className="px-5 pb-5">
                <Link href={`/app/listing/?id=${listing.id}`} className="font-bold text-ink hover:text-strike">
                  {property.name} {listing.unitLabel}
                </Link>
                <div className="text-[13px] text-ink-3">{listing.headline}</div>
                <div className="mt-2 text-[13px] text-ash">Move-in: {lead.moveInDate ? new Date(lead.moveInDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "not given"}</div>
                {lead.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {lead.tags.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </Card>

            <Card>
              <CardHeader title="Pre-qualification" subtitle={qset.name} />
              {lead.answers.length === 0 ? (
                <div className="px-5 pb-5 text-[13.5px] text-ash">Hasn't answered yet. The instant reply text includes the link.</div>
              ) : (
                <ul className="px-5 pb-5 space-y-2.5">
                  {qset.questions.map((q) => {
                    const a = lead.answers.find((x) => x.questionId === q.id);
                    return (
                      <li key={q.id} className="flex items-start gap-2.5 text-[13.5px]">
                        {a ? a.passed ? <Check size={15} className="text-leaf mt-0.5 shrink-0" /> : <X size={15} className="text-strike mt-0.5 shrink-0" /> : <span className="size-[15px] mt-0.5 shrink-0" />}
                        <div>
                          <div className="text-ink-3">{q.prompt}</div>
                          <div className="font-semibold text-ink">{a?.answer || "—"}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card>
              <CardHeader title="Tours" />
              {showings.length === 0 ? (
                <div className="px-5 pb-5 text-[13.5px] text-ash">No tours yet.</div>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {showings.map((s) => (
                    <li key={s.id} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/tour/?id=${s.id}`} className="font-semibold text-ink hover:text-strike text-[14px]">
                          {fmtDateTime(s.startsAt)}
                        </Link>
                        <ShowingStatusBadge status={s.status} />
                      </div>
                      <div className="text-[12.5px] text-ash">{s.type === "SELF" ? "Self-guided" : `Guided · ${demo.agents.find((a) => a.id === s.agentId)?.name}`}</div>
                      {s.status === "REQUESTED" && (
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => demo.confirmShowing(s.id)}>
                            Mark confirmed
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => demo.cancelShowing(s.id, "staff")}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHeader title="Rent Manager" />
              <div className="px-5 pb-5 text-[13.5px]">
                {lead.rmProspectId ? (
                  <>
                    <div className="text-ink">
                      Prospect <span className="font-mono">#{lead.rmProspectId}</span>
                    </div>
                    <div className="text-ash mt-0.5">Tour history is written to the prospect's History/Notes.</div>
                  </>
                ) : (
                  <>
                    <div className="text-ink-3">Not in Rent Manager yet.</div>
                    <div className="text-ash mt-0.5">Qualified leads are pushed as Prospects on the next sync.</div>
                  </>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Notes" />
              <div className="px-5 pb-5">
                <Textarea value={note || lead.notes || ""} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for the team" className="min-h-20" />
                <Button size="sm" variant="secondary" className="mt-2" onClick={() => { demo.updateLead(lead.id, { notes: note }); toast.show("Note saved"); }}>
                  Save note
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </Page>

      <Modal open={booking} onClose={() => setBooking(false)} title={`Book a tour for ${lead.firstName}`} width="max-w-2xl">
        <SlotPicker
          listingId={listing.id}
          tourType={tourType}
          setTourType={setTourType}
          onPick={(startsAt, agentId) => {
            demo.bookShowing({ leadId: lead.id, listingId: listing.id, type: tourType, startsAt, agentId });
            setBooking(false);
            toast.show("Tour requested. Confirmation text sent.");
          }}
        />
      </Modal>
      {toast.node}
    </>
  );
}
