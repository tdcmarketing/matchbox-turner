"use client";

import { use, useEffect } from "react";
import { useDemo } from "@/lib/store";
import { Hydrated } from "@/components/Hydrated";
import { Button } from "@/components/ui";
import { fmtTime } from "@/lib/format";
import { Check, KeyRound, LockKeyhole, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function AccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Hydrated>
      <Access id={id} />
    </Hydrated>
  );
}

function Access({ id }: { id: string }) {
  const demo = useDemo();
  const showing = demo.showings.find((s) => s.id === id);
  const listing = showing ? demo.listings.find((l) => l.id === showing.listingId) : undefined;
  const property = listing ? demo.properties.find((p) => p.id === listing.propertyId) : undefined;
  const lockbox = listing ? demo.lockboxes.find((b) => b.id === listing.lockboxId) : undefined;
  const now = demo.now();

  const msToStart = showing ? new Date(showing.startsAt).getTime() - now.getTime() : Infinity;
  const windowOpen = !!showing && showing.status !== "CANCELLED" && msToStart <= demo.settings.codeReleaseMinutes * 60000 && now.getTime() < new Date(showing.endsAt).getTime() + 60 * 60000;

  useEffect(() => {
    if (showing && windowOpen && !showing.accessCode) demo.releaseCode(showing.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showing?.id, windowOpen]);

  if (!showing || !listing || !property) return <div className="mx-auto max-w-xl px-5 py-20 text-center text-ink-3">This tour link has expired.</div>;

  if (!windowOpen) {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <span className="mx-auto size-14 rounded-full bg-paper flex items-center justify-center text-ink-3">
          <LockKeyhole size={24} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">Not quite yet</h1>
        <p className="mt-2 text-ink-3">
          Your code for {property.name} {listing.unitLabel} unlocks at{" "}
          <span className="font-semibold text-ink">{fmtTime(new Date(new Date(showing.startsAt).getTime() - demo.settings.codeReleaseMinutes * 60000).toISOString())}</span>, {demo.settings.codeReleaseMinutes} minutes before your tour.
        </p>
        <Link href={`/tour/${showing.id}`} className="inline-block mt-6 text-sm font-semibold text-strike">
          Back to tour details
        </Link>
      </div>
    );
  }

  const checkedIn = !!showing.checkedInAt;
  const checkedOut = !!showing.checkedOutAt;

  return (
    <div className="mx-auto max-w-md px-5 py-8">
      <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-ash">Self-guided tour · {fmtTime(showing.startsAt)}</div>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
        {property.name} {listing.unitLabel}
      </h1>
      <div className="mt-1 flex items-center gap-1.5 text-[14px] text-ink-3">
        <MapPin size={14} /> {property.address}
      </div>

      <div className="mt-6 rounded-lg bg-ink text-white p-6 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 size-32 rounded-full bg-strike/30 blur-2xl" />
        <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/60 flex items-center gap-2">
          <KeyRound size={13} /> Lockbox code
        </div>
        <div className="strike-code mt-3 text-[56px] leading-none font-semibold">{showing.accessCode ?? "····"}</div>
        <div className="mt-4 text-[14px] text-white/75">
          <span className="font-semibold text-white">Where:</span> {lockbox?.location ?? "See your text message"}
        </div>
        <div className="mt-1 text-[13px] text-white/50">This code works once, from {fmtTime(new Date(new Date(showing.startsAt).getTime() - demo.settings.codeReleaseMinutes * 60000).toISOString())} until {fmtTime(new Date(new Date(showing.endsAt).getTime() + 60 * 60000).toISOString())}.</div>
      </div>

      <ol className="mt-6 space-y-4">
        {[
          ["Press the code, then the key symbol", "The box opens downward. Take the key labeled " + (listing.unitLabel) + "."],
          ["Tour at your own pace", "Lights are on. Please leave doors and windows as you found them."],
          ["Return the key and close the box", "Press the key symbol again to lock. Then tap Check out below."],
        ].map(([t, b], i, arr) => (
          <li key={t} className={`matchstick is-lit ${i === arr.length - 1 ? "is-last" : ""}`}>
            <div className="font-bold text-ink text-[15px]">{t}</div>
            <div className="text-[13.5px] text-ink-3">{b}</div>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid grid-cols-2 gap-2">
        <Button size="lg" variant={checkedIn ? "secondary" : "primary"} disabled={checkedIn} onClick={() => demo.checkIn(showing.id)}>
          {checkedIn ? (
            <>
              <Check size={16} /> Checked in {fmtTime(showing.checkedInAt!)}
            </>
          ) : (
            "I'm inside"
          )}
        </Button>
        <Button size="lg" variant={checkedOut ? "secondary" : "ink"} disabled={!checkedIn || checkedOut} onClick={() => demo.checkOut(showing.id)}>
          {checkedOut ? (
            <>
              <Check size={16} /> Checked out
            </>
          ) : (
            "Check out"
          )}
        </Button>
      </div>

      {checkedOut && (
        <div className="mt-5 rounded-lg bg-leaf-soft p-5 rise">
          <div className="font-bold text-ink">Thanks for locking up.</div>
          <p className="mt-1 text-[14px] text-ink-2">We just texted you a two-tap feedback link. Or do it here:</p>
          <Button className="mt-3" href={`/feedback/${showing.id}`}>
            How was the tour?
          </Button>
        </div>
      )}

      <a href="tel:5404346673" className="mt-8 flex items-center justify-center gap-2 text-[13.5px] font-semibold text-ink-3 hover:text-strike">
        <Phone size={14} /> Trouble getting in? Call (540) 434-6673
      </a>
    </div>
  );
}
