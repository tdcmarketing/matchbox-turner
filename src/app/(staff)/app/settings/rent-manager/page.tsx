"use client";

import { useState } from "react";
import { useDemo } from "@/lib/store";
import { Page, PageHeader } from "@/components/staff/Shell";
import { Badge, Button, Card, CardHeader, Eyebrow, Toggle } from "@/components/ui";
import { fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ArrowLeftRight, ArrowRight, Check, CircleHelp, RefreshCw } from "lucide-react";

const flows = [
  { dir: "in", what: "Properties and units", detail: "Vacant or notice-given units become draft listings with rent, beds/baths, square footage, and available date already filled in.", api: "GET /Properties, GET /Units?filters=IsVacant", status: "built" },
  { dir: "in", what: "Marketing copy and photos", detail: "If Matchbox keeps unit descriptions and photos in RM's marketing fields, pull them so nobody types a listing twice.", api: "GET /Units/{id}/Marketing, /Units/{id}/Images", status: "question" },
  { dir: "in", what: "Unit goes off market", detail: "When RM shows a lease signed, the listing flips to Leased, tours stop, and syndication drops it. Waitlisted leads for the next vacancy stay.", api: "Nightly diff on IsVacant + Leases", status: "built" },
  { dir: "out", what: "Qualified leads → Prospects", detail: "The moment a lead passes pre-qualification, create the Prospect in RM with name, phone, email, source, desired unit, and move-in date.", api: "POST /Prospects", status: "built" },
  { dir: "out", what: "Tour history → Prospect notes", detail: "Every confirmation, tour, no-show, and feedback line is written to the Prospect's History/Notes so the RM record is the system of record.", api: "POST /History", status: "built" },
  { dir: "out", what: "Application handoff", detail: "The apply link after a good tour opens RM's online application with the prospect and unit pre-selected, so screening (AmRent) and eSign stay inside RM.", api: "Prospect & Tenant Portal deep link", status: "question" },
  { dir: "in", what: "Guest Cards and Web Chat leads", detail: "Leads that arrive through RM's own website Guest Card or Web Chat get pulled in so they enter the same text-and-book flow.", api: "GET /Prospects?since=", status: "question" },
  { dir: "both", what: "Texting", detail: "RM's texting and rmVoIP are built for tenants and owners. Tour texts need a dedicated 10DLC-registered number with reply handling (C, CANCEL, STOP). Decide whether to log outbound tour texts to RM as History.", api: "Twilio + POST /History", status: "question" },
] as const;

const questions = [
  {
    topic: "Access",
    items: [
      "Is the Rent Manager API add-on enabled on Matchbox's RMO database? If not, who at LCS turns it on and what does it cost?",
      "Can we get a sandbox or a read-only API user first, before write access to Prospects?",
      "Does Matchbox already use Open Access (read-only DB views)? That would let us do reporting without touching the API.",
    ],
  },
  {
    topic: "How Matchbox uses RM today",
    items: [
      "Where does 'this unit is available' get decided today: a status on the unit, the lease end date, or the make-ready board?",
      "Are unit descriptions, amenities, and photos maintained in RM's marketing fields, on the website, or both?",
      "Is RM's ILS syndication (Zillow, Apartments.com, Zumper, Apartment List, Rent.com) turned on for all properties, or only some?",
      "Which RM modules are licensed: Prospect Manager, Web Chat, Texting, rmVoIP, Signable Documents, AmRent screening?",
      "Student housing is leased by the bed with guarantors. How is that modeled in RM: one unit with multiple leases, or one unit per bed?",
    ],
  },
  {
    topic: "Leads and prospects",
    items: [
      "Where do ILS leads land right now: Guest Cards in RM, a shared inbox, or the ILS's own dashboard?",
      "Who is expected to respond to a new lead, and how fast? What happens on nights and weekends?",
      "Do you want every lead in RM as a Prospect, or only qualified ones? RM Prospects can pile up.",
      "Which Prospect fields and statuses do you use so we mirror them instead of inventing our own?",
    ],
  },
  {
    topic: "Tours and access",
    items: [
      "How are showings scheduled today, and who has keys? Is there a key log?",
      "Which homes would you be comfortable opening for self-guided tours first: vacant units only, downtown only, student only?",
      "Any lockboxes already in use? Brand and how codes are managed.",
      "Should a self-guided tour require a photo ID upload, a hold on a card, or just a confirmed phone number?",
    ],
  },
  {
    topic: "Applications and screening",
    items: [
      "The apply link points at RM's online application. Can that link pre-select the unit and prospect?",
      "Is PetScreening triggered from RM or separately? We can prompt it right after tour feedback when the lead has a pet.",
      "Do you want Matchbox Turner to know when an application is submitted or approved so the lead's status updates without anyone touching it?",
    ],
  },
  {
    topic: "Reporting",
    items: [
      "Do owners get a leasing report today? From RM, or a spreadsheet? What's on it?",
      "Which numbers matter most to you: days to lease, lead source ROI, no-show rate, tours per lease?",
    ],
  },
];

const betterThan = [
  ["Rent Manager stops at the Guest Card", "It captures the lead. It doesn't qualify them, book the tour, remind them, or let them in. That gap is what Tenant Turner sells, and what this fills."],
  ["No duplicate data entry", "Units come from RM; qualified leads go back to RM as Prospects with the full tour story in Notes. Leasing staff keep working in RM."],
  ["Syndication stays in RM", "RM already pushes to the big five ILS sites. We don't rebuild that; we make sure the leads those sites generate get answered in under a minute."],
  ["Bed-level leasing for JMU", "Tenant Turner is unit-centric. Group tours, guarantors, and per-bed pricing are first-class here because Charleston Townes and Devon Lane need them."],
  ["Owner and lockbox reporting", "Every tour, code, check-in, and no-show is a record. That becomes the owner report and the answer to 'who was in the unit Tuesday?'"],
];

export default function RentManagerPage() {
  const demo = useDemo();
  const [running, setRunning] = useState(false);
  const last = demo.syncRuns[0];
  const [autoSync, setAutoSync] = useState(true);
  const [pushProspects, setPushProspects] = useState(true);

  const run = () => {
    setRunning(true);
    window.setTimeout(() => {
      demo.runRmSync();
      setRunning(false);
    }, 1400);
  };

  return (
    <>
      <PageHeader
        eyebrow="Integration"
        title="Rent Manager"
        subtitle="What flows between Matchbox Turner and Rent Manager, what's built, and the open questions for Matchbox."
        action={
          <>
            <Button variant="secondary" href="/rm">
              What Matchbox sees in RM
            </Button>
            <Button onClick={run} disabled={running}>
              <RefreshCw size={15} className={cn(running && "animate-spin")} /> {running ? "Syncing…" : "Sync now"}
            </Button>
          </>
        }
      />
      <Page>
        <div className="grid gap-5 xl:grid-cols-[1fr_400px]">
          <div className="space-y-5">
            <Card>
              <CardHeader
                title="Connection"
                subtitle="Sandbox: reads from a fixture shaped like Matchbox's RM data. Swap in real credentials when the API add-on is enabled."
                action={<Badge tone="amber">Sandbox</Badge>}
              />
              <div className="px-5 pb-5 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[13.5px]">
                <div>
                  <div className="text-ash">Database</div>
                  <div className="font-mono text-ink">matchbox.api.rentmanager.com</div>
                </div>
                <div>
                  <div className="text-ash">Auth</div>
                  <div className="font-mono text-ink">X-RM12Api-ApiToken · api user “turner”</div>
                </div>
                <div>
                  <div className="text-ash">Last sync</div>
                  <div className="text-ink">{last ? fmtDateTime(last.finishedAt) : "Never"}</div>
                </div>
                <div>
                  <div className="text-ash">Schedule</div>
                  <div className="text-ink">Every 15 minutes, plus on demand</div>
                </div>
                <div className="sm:col-span-2 flex flex-wrap gap-6 pt-1">
                  <Toggle checked={autoSync} onChange={setAutoSync} label="Pull units automatically" />
                  <Toggle checked={pushProspects} onChange={setPushProspects} label="Push qualified leads as Prospects" />
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="What syncs" subtitle="Direction, what it does for Matchbox, and the RM API call behind it" />
              <ul className="divide-y divide-line-soft">
                {flows.map((f) => (
                  <li key={f.what} className="px-5 py-3.5 grid gap-3 md:grid-cols-[28px_1fr_auto] items-start">
                    <span className={cn("mt-0.5 size-7 rounded-full flex items-center justify-center", f.dir === "in" ? "bg-sky-soft text-sky" : f.dir === "out" ? "bg-strike-soft text-strike" : "bg-paper text-ink-3")} title={f.dir === "in" ? "Rent Manager → Turner" : f.dir === "out" ? "Turner → Rent Manager" : "Both ways"}>
                      {f.dir === "both" ? <ArrowLeftRight size={14} /> : <ArrowRight size={14} className={cn(f.dir === "out" && "rotate-180")} />}
                    </span>
                    <div>
                      <div className="font-semibold text-ink text-[14px]">{f.what}</div>
                      <div className="text-[13px] text-ink-3 mt-0.5">{f.detail}</div>
                      <div className="text-[11.5px] font-mono text-smoke mt-1">{f.api}</div>
                    </div>
                    {f.status === "built" ? (
                      <Badge tone="green">
                        <Check size={11} /> In demo
                      </Badge>
                    ) : (
                      <Badge tone="amber">
                        <CircleHelp size={11} /> Open question
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
              <div className="px-5 py-3 text-[12px] text-ash flex gap-4">
                <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-sky" /> Rent Manager → Turner</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-strike" /> Turner → Rent Manager</span>
              </div>
            </Card>

            <Card>
              <CardHeader title="Questions for Matchbox" subtitle="Grouped so the meeting runs in order. Answers decide the integration scope." />
              <div className="px-5 pb-5 space-y-5">
                {questions.map((g, gi) => (
                  <div key={g.topic}>
                    <Eyebrow className="mb-2">
                      {gi + 1}. {g.topic}
                    </Eyebrow>
                    <ul className="space-y-2">
                      {g.items.map((q) => (
                        <li key={q} className="flex items-start gap-2.5 text-[14px] text-ink-2 leading-relaxed">
                          <span className="mt-2 size-1.5 rounded-full bg-line shrink-0" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader title="Sync log" subtitle="Press Sync now to watch a run" />
              {demo.syncRuns.length === 0 ? (
                <div className="px-5 pb-5 text-[13.5px] text-ash">No runs yet in this session. The fixture contains two units that aren't listed yet, one rent change, and one unit that RM now shows as leased.</div>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {demo.syncRuns.map((r) => (
                    <li key={r.id} className="px-5 py-3.5">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-ink text-[13.5px]">{fmtDateTime(r.startedAt)}</div>
                        <Badge tone="green">ok · 2.4s</Badge>
                      </div>
                      <div className="mt-1 text-[12.5px] text-ink-3 tabular">
                        {r.created} created · {r.updated} updated · {r.leasedDetected} leased · {r.prospectsPushed} prospects pushed · {r.skipped} unchanged
                      </div>
                      <ul className="mt-2 space-y-1">
                        {r.notes.map((n) => (
                          <li key={n} className="text-[12.5px] text-ink-2 flex gap-2">
                            <span className="text-smoke">›</span> {n}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHeader title="Where this beats the off-the-shelf option" subtitle="For the conversation with Matchbox" />
              <ul className="px-5 pb-5 space-y-3.5">
                {betterThan.map(([t, b]) => (
                  <li key={t}>
                    <div className="font-semibold text-ink text-[14px]">{t}</div>
                    <div className="text-[13px] text-ink-3 leading-relaxed">{b}</div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader title="What Rent Manager already does" subtitle="So we don't rebuild it" />
              <ul className="px-5 pb-5 space-y-1.5 text-[13.5px] text-ink-2">
                {["Guest Cards (website lead form → Prospect)", "Prospect Manager / CRM and reports", "ILS syndication to Zillow, Apartments.com, Zumper, Apartment List, Rent.com", "Online applications and Signable Documents", "AmRent resident screening", "Web Chat, Texting, Text Broadcast, rmVoIP call recording", "Prospect & Tenant Portal, Resident App", "Letter templates with merge fields", "Open API (read/write) and Open Access (read-only views)"].map((x) => (
                  <li key={x} className="flex items-start gap-2">
                    <Check size={14} className="text-leaf mt-1 shrink-0" /> {x}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </Page>
    </>
  );
}
