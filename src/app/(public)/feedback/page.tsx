"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDemo } from "@/lib/store";
import { Hydrated } from "@/components/Hydrated";
import { Button, Textarea } from "@/components/ui";
import { Check, Star } from "lucide-react";

export default function FeedbackPage() {
  return (
    <Suspense fallback={null}>
      <FeedbackPageInner />
    </Suspense>
  );
}

function FeedbackPageInner() {
  const id = useSearchParams().get("id") ?? "";
  return (
    <Hydrated>
      <Feedback id={id} />
    </Hydrated>
  );
}

function Feedback({ id }: { id: string }) {
  const demo = useDemo();
  const showing = demo.showings.find((s) => s.id === id);
  const [rating, setRating] = useState(0);
  const [interested, setInterested] = useState<boolean | null>(null);
  const [comments, setComments] = useState("");
  if (!showing) return <div className="mx-auto max-w-xl px-5 py-20 text-center text-ink-3">This link has expired.</div>;
  const listing = demo.listings.find((l) => l.id === showing.listingId)!;
  const property = demo.properties.find((p) => p.id === listing.propertyId)!;
  const lead = demo.leads.find((l) => l.id === showing.leadId)!;

  if (showing.feedback) {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <span className="mx-auto size-14 rounded-full bg-leaf-soft text-[#3f6f18] flex items-center justify-center">
          <Check size={26} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">Thanks, {lead.firstName}.</h1>
        {showing.feedback.interested ? (
          <>
            <p className="mt-2 text-ink-3">We emailed you the application link. It takes about 10 minutes.</p>
            <Button href={demo.settings.applicationUrl} size="lg" className="mt-6">
              Apply for {property.name}
            </Button>
          </>
        ) : (
          <p className="mt-2 text-ink-3">We'll keep an eye out for homes that fit better and text you when one opens.</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-10">
      <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-ash">Your tour</div>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">How was {property.name} {listing.unitLabel}?</h1>

      <div className="mt-6 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`} className="p-1">
            <Star size={34} className={n <= rating ? "fill-strike text-strike" : "text-line"} />
          </button>
        ))}
      </div>

      <div className="mt-6 text-[14px] font-semibold text-ink-2">Could you see yourself living here?</div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {[
          [true, "Yes, send me the application"],
          [false, "Not this one"],
        ].map(([v, label]) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => setInterested(v as boolean)}
            className={`h-12 rounded-md border text-sm font-semibold ${interested === v ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2"}`}
          >
            {label as string}
          </button>
        ))}
      </div>

      <Textarea className="mt-5" placeholder="Anything we should know? (optional)" value={comments} onChange={(e) => setComments(e.target.value)} />

      <Button size="lg" className="w-full mt-5" disabled={!rating || interested === null} onClick={() => demo.submitFeedback(showing.id, { rating, interested: interested!, comments: comments || undefined })}>
        Send feedback
      </Button>
    </div>
  );
}
