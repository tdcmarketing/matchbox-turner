"use client";

import { use, useState } from "react";
import { useDemo } from "@/lib/store";
import { Hydrated } from "@/components/Hydrated";
import { Badge, Button, Modal } from "@/components/ui";
import { fmtDateLong, fmtTime, fmtAgo } from "@/lib/format";
import { SlotPicker } from "@/components/public/SlotPicker";
import { Check, KeyRound, MapPin, UserRound } from "lucide-react";
import Link from "next/link";

export default function TourStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Hydrated>
      <TourStatus id={id} />
    </Hydrated>
  );
}

function TourStatus({ id }: { id: string }) {
  const demo = useDemo();
  const showing = demo.showings.find((s) => s.id === id);
  const [resched, setResched] = useState(false);
  const [tourType, setTourType] = useState<"AGENT" | "SELF">(showing?.type ?? "AGENT");
  if (!showing) return <div className="mx-auto max-w-xl px-5 py-20 text-center text-ink-3">This tour link has expired.</div>;
  const listing = demo.listings.find((l) => l.id === showing.listingId)!;
  const property = demo.properties.find((p) => p.id === listing.propertyId)!;
  const lead = demo.leads.find((l) => l.id === showing.leadId)!;
  const agent = showing.agentId ? demo.agents.find((a) => a.id === showing.agentId) : undefined;
  const now = demo.now();
  const msToStart = new Date(showing.startsAt).getTime() - now.getTime();
  const isSelf = showing.type === "SELF";
  const accessOpen = isSelf && showing.status === "CONFIRMED" && msToStart <= demo.settings.codeReleaseMinutes * 60000;

  const statusTone = { REQUESTED: "amber", CONFIRMED: "green", CANCELLED: "neutral", UNCONFIRMED_CANCELLED: "neutral", NO_SHOW: "neutral", COMPLETED: "blue" } as const;
  const statusLabel = { REQUESTED: "Needs confirmation", CONFIRMED: "Confirmed", CANCELLED: "Cancelled", UNCONFIRMED_CANCELLED: "Released", NO_SHOW: "Missed", COMPLETED: "Completed" };

  return (
    <div className="mx-auto max-w-xl px-5 sm:px-8 py-10">
      <Badge tone={statusTone[showing.status]} dot>
        {statusLabel[showing.status]}
      </Badge>
      <h1 className="mt-3 text-[30px] font-extrabold tracking-tight leading-tight text-ink">
        {fmtDateLong(showing.startsAt)}
        <br />
        <span className="text-ink-3 font-bold">{fmtTime(showing.startsAt)} – {fmtTime(showing.endsAt)}</span>
      </h1>
      <div className="mt-3 text-ink-2">
        {property.name} {listing.unitLabel}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[14px] text-ink-3">
        <MapPin size={14} /> {property.address}, {property.city}
      </div>

      <div className="mt-6 rounded-lg bg-white border border-line-soft shadow-card p-5 flex items-center gap-3">
        {agent ? (
          <>
            <span className="size-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: agent.color }}>
              {agent.initials}
            </span>
            <div className="text-[14px]">
              <div className="font-bold text-ink flex items-center gap-1.5">
                <UserRound size={14} /> Guided by {agent.name}
              </div>
              <div className="text-ink-3">{agent.title} · {agent.phone}</div>
            </div>
          </>
        ) : (
          <>
            <span className="size-10 rounded-full bg-ink text-white flex items-center justify-center">
              <KeyRound size={18} />
            </span>
            <div className="text-[14px]">
              <div className="font-bold text-ink">Self-guided tour</div>
              <div className="text-ink-3">Your one-time code arrives {demo.settings.codeReleaseMinutes} minutes before.</div>
            </div>
          </>
        )}
      </div>

      {showing.status === "REQUESTED" && (
        <div className="mt-6 rounded-lg bg-amber-soft p-5">
          <div className="font-bold text-ink">Please confirm, {lead.firstName}.</div>
          <p className="mt-1 text-[14px] text-ink-2">Unconfirmed tours are released {demo.settings.confirmDeadlineHours} hours before the start so someone else can take the slot.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="lg" onClick={() => demo.confirmShowing(showing.id)}>
              <Check size={16} /> Confirm tour
            </Button>
            <Button size="lg" variant="secondary" onClick={() => setResched(true)}>
              Change time
            </Button>
          </div>
        </div>
      )}

      {showing.status === "CONFIRMED" && (
        <div className="mt-6 space-y-3">
          {accessOpen ? (
            <Link href={`/tour/${showing.id}/access`} className="block rounded-lg bg-strike text-white p-5 hover:bg-strike-deep">
              <div className="text-[12px] font-bold uppercase tracking-wider text-white/70">Your tour starts {fmtAgo(showing.startsAt, now)}</div>
              <div className="mt-1 text-xl font-extrabold flex items-center gap-2">
                <KeyRound size={20} /> Get your access code →
              </div>
            </Link>
          ) : (
            <div className="rounded-lg bg-leaf-soft p-5 text-[14px] text-ink-2">
              <span className="font-bold text-ink">You're all set.</span> We'll remind you the day before and an hour before.
              {isSelf && " Your access code will show here and by text when it's time."}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setResched(true)}>
              Change time
            </Button>
            <Button variant="danger" onClick={() => demo.cancelShowing(showing.id, "lead")}>
              Cancel tour
            </Button>
          </div>
        </div>
      )}

      {(showing.status === "CANCELLED" || showing.status === "UNCONFIRMED_CANCELLED") && (
        <div className="mt-6 rounded-lg bg-paper p-5">
          <div className="font-bold text-ink">This tour was {showing.status === "CANCELLED" ? "cancelled" : "released because it wasn't confirmed"}.</div>
          <p className="mt-1 text-[14px] text-ink-3">Still interested in {property.name}? Pick a new time.</p>
          <Button className="mt-4" onClick={() => setResched(true)}>
            Rebook
          </Button>
        </div>
      )}

      {showing.status === "COMPLETED" && (
        <div className="mt-6 rounded-lg bg-paper p-5">
          <div className="font-bold text-ink">Thanks for touring.</div>
          <p className="mt-1 text-[14px] text-ink-3">{showing.feedback ? "We got your feedback." : "Tell us how it went."}</p>
          <div className="mt-4 flex gap-2">
            {!showing.feedback && <Button href={`/feedback/${showing.id}`}>Leave feedback</Button>}
            <Button href={demo.settings.applicationUrl} variant={showing.feedback ? "primary" : "secondary"}>
              Apply now
            </Button>
          </div>
        </div>
      )}

      <Modal open={resched} onClose={() => setResched(false)} title="Change your tour time" width="max-w-2xl">
        <SlotPicker
          listingId={listing.id}
          tourType={tourType}
          setTourType={setTourType}
          title="Pick a new time"
          onPick={(startsAt, agentId) => {
            demo.rescheduleShowing(showing.id, startsAt, agentId);
            setResched(false);
          }}
        />
      </Modal>
    </div>
  );
}
