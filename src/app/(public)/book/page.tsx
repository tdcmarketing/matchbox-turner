"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDemo } from "@/lib/store";
import { Hydrated } from "@/components/Hydrated";
import { Button, Field, Input, Select } from "@/components/ui";
import { checkAnswer, evaluateAnswers } from "@/lib/prequal";
import { fmtDateTime } from "@/lib/format";
import { SlotPicker } from "@/components/public/SlotPicker";
import type { Lead, PrequalAnswer, Showing } from "@/lib/data/types";
import { Check } from "lucide-react";

export default function TourPage() {
  return (
    <Suspense fallback={null}>
      <TourPageInner />
    </Suspense>
  );
}

function TourPageInner() {
  const slug = useSearchParams().get("slug") ?? "";
  return (
    <Hydrated>
      <TourFlow slug={slug} />
    </Hydrated>
  );
}

type Step = "contact" | "questions" | "result" | "pick" | "booked";

function TourFlow({ slug }: { slug: string }) {
  const demo = useDemo();
  const listing = demo.listings.find((l) => l.slug === slug)!;
  const property = demo.properties.find((p) => p.id === listing.propertyId)!;
  const qset = demo.prequalSets.find((q) => q.id === listing.prequalSetId)!;
  const bookable = listing.status === "ACTIVE" && listing.showingMode !== "NONE";

  const [step, setStep] = useState<Step>("contact");
  const [contact, setContact] = useState({ firstName: "", lastName: "", email: "", phone: "", consentSms: true });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [lead, setLead] = useState<Lead | null>(null);
  const [showing, setShowing] = useState<Showing | null>(null);
  const [tourType, setTourType] = useState<"AGENT" | "SELF">(listing.showingMode === "SELF" ? "SELF" : "AGENT");

  const steps: { key: Step; label: string }[] = [
    { key: "contact", label: "About you" },
    { key: "questions", label: "Five questions" },
    { key: "pick", label: bookable ? "Pick a time" : "Waitlist" },
    { key: "booked", label: "Done" },
  ];
  const stepIndex = step === "result" ? 1 : steps.findIndex((s) => s.key === step);

  const result = useMemo(() => {
    const list: PrequalAnswer[] = qset.questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? "", passed: checkAnswer(q, answers[q.id] ?? "") }));
    return { list, ...evaluateAnswers(qset, list) };
  }, [answers, qset]);

  function submitQuestions() {
    const created = demo.createLead({
      listingId: listing.id,
      ...contact,
      answers: result.list,
      moveInDate: answers["q-movein"],
    });
    setLead(created);
    if (created.status === "QUALIFIED") setStep("pick");
    else setStep("result");
  }

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-8">
      <Link href={`/listing/?slug=${listing.slug}`} className="text-[13px] font-semibold text-ash hover:text-ink">
        ← {property.name} {listing.unitLabel}
      </Link>

      <ol className="mt-5 flex items-center gap-2 text-[12.5px] font-semibold">
        {steps.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className={`inline-flex size-6 items-center justify-center rounded-full ${i < stepIndex ? "bg-leaf text-white" : i === stepIndex ? "bg-strike text-white" : "bg-line text-ink-3"}`}>
              {i < stepIndex ? <Check size={13} /> : i + 1}
            </span>
            <span className={i === stepIndex ? "text-ink" : "text-ash"}>{s.label}</span>
            {i < steps.length - 1 && <span className="w-6 h-px bg-line mx-1" />}
          </li>
        ))}
      </ol>

      <div className="mt-6 bg-white rounded-lg border border-line-soft shadow-card p-6 sm:p-8 rise" key={step}>
        {step === "contact" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep("questions");
            }}
          >
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">{bookable ? "Let's set up your tour" : "Join the waitlist"}</h1>
            <p className="mt-1 text-ink-3">{bookable ? "We'll text you a confirmation and your tour details." : "We'll text you the moment this home opens up."}</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <Field label="First name">
                <Input required autoFocus value={contact.firstName} onChange={(e) => setContact({ ...contact, firstName: e.target.value })} />
              </Field>
              <Field label="Last name">
                <Input required value={contact.lastName} onChange={(e) => setContact({ ...contact, lastName: e.target.value })} />
              </Field>
              <Field label="Mobile phone" hint="Tour confirmations and your access code arrive by text.">
                <Input required type="tel" placeholder="(540) 555-0100" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input required type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
              </Field>
            </div>
            <label className="mt-5 flex items-start gap-2.5 text-[13.5px] text-ink-2">
              <input type="checkbox" className="mt-0.5 accent-[var(--strike)]" checked={contact.consentSms} onChange={(e) => setContact({ ...contact, consentSms: e.target.checked })} />
              <span>Text me about this tour. Message and data rates may apply. Reply STOP any time.</span>
            </label>
            <div className="mt-6 flex justify-end">
              <Button type="submit" size="lg">
                Continue
              </Button>
            </div>
          </form>
        )}

        {step === "questions" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitQuestions();
            }}
          >
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">A few quick questions</h1>
            <p className="mt-1 text-ink-3">These help us make sure this home is a fit before you spend time touring.</p>
            <div className="mt-6 space-y-5">
              {qset.questions.map((q) => (
                <Field key={q.id} label={q.prompt} hint={q.help}>
                  {q.type === "YES_NO" && (
                    <div className="grid grid-cols-2 gap-2">
                      {["Yes", "No"].map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [q.id]: o })}
                          className={`h-11 rounded-md border text-sm font-semibold transition-colors ${answers[q.id] === o ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:border-ink-3"}`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  )}
                  {q.type === "SELECT" && (
                    <Select required value={answers[q.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}>
                      <option value="" disabled>
                        Choose one
                      </option>
                      {q.options!.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </Select>
                  )}
                  {q.type === "DATE" && <Input required type="date" value={answers[q.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />}
                  {q.type === "NUMBER" && <Input required type="number" min={0} value={answers[q.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />}
                  {q.type === "TEXT" && <Input value={answers[q.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />}
                </Field>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep("contact")}>
                Back
              </Button>
              <Button type="submit" size="lg" disabled={qset.questions.some((q) => q.required && !answers[q.id])}>
                {bookable ? "See tour times" : "Join the waitlist"}
              </Button>
            </div>
          </form>
        )}

        {step === "result" && lead && (
          <div>
            {lead.status === "WAITLIST" ? (
              <>
                <h1 className="text-2xl font-extrabold tracking-tight text-ink">You're on the list, {lead.firstName}.</h1>
                <p className="mt-2 text-ink-2 leading-relaxed">
                  {result.failed?.waitlistOnFail ? result.failed.disqualifyMessage : `${property.name} ${listing.unitLabel} isn't taking tours right now. We'll text you at ${lead.phone} as soon as it opens up.`}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold tracking-tight text-ink">Thanks for checking, {lead.firstName}.</h1>
                <p className="mt-2 text-ink-2 leading-relaxed">{result.failed?.disqualifyMessage}</p>
                <p className="mt-3 text-[13.5px] text-ash">Questions about our criteria? Call the leasing office at (540) 434-6673.</p>
              </>
            )}
            <div className="mt-6 flex gap-3">
              <Button href="/listings" variant="secondary">
                Browse other homes
              </Button>
            </div>
          </div>
        )}

        {step === "pick" && lead && (
          <SlotPicker
            listingId={listing.id}
            tourType={tourType}
            setTourType={setTourType}
            onPick={(startsAt, agentId) => {
              const s = demo.bookShowing({ leadId: lead.id, listingId: listing.id, type: tourType, startsAt, agentId });
              setShowing(s);
              setStep("booked");
            }}
          />
        )}

        {step === "booked" && showing && lead && (
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-leaf-soft text-[#3f6f18] px-3 py-1 text-[12.5px] font-bold uppercase tracking-wide">
              <Check size={14} /> Tour requested
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">
              {fmtDateTime(showing.startsAt)}
            </h1>
            <p className="mt-1 text-ink-3">
              {property.name} {listing.unitLabel} · {property.address}
            </p>
            <div className="mt-6 rounded-lg bg-paper p-5 text-[14.5px] leading-relaxed text-ink-2">
              We just texted <span className="font-semibold text-ink">{lead.phone}</span>. Reply <span className="font-mono font-semibold text-ink">C</span> to confirm, or use the button below.
              {showing.type === "SELF" ? " Your one-time lockbox code arrives 15 minutes before your tour." : " Your leasing agent will meet you at the door."}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={`/tour/?id=${showing.id}`} size="lg">
                Confirm this tour
              </Button>
              <Button href="/listings" variant="ghost" size="lg">
                Back to homes
              </Button>
            </div>
            <p className="mt-5 text-[12.5px] text-ash">Demo note: the confirmation text is visible in the staff app under Messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
