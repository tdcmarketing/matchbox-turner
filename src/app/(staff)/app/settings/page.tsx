"use client";

import { useState } from "react";
import { uid, useDemo } from "@/lib/store";
import { Page, PageHeader } from "@/components/staff/Shell";
import { Avatar, Badge, Button, Card, CardHeader, Field, Input, Select, Textarea, Toggle, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { PrequalQuestion } from "@/lib/data/types";
import { GripVertical } from "lucide-react";

const tabs = ["Questions", "Message templates", "Availability", "Team", "Rules"] as const;
type Tab = (typeof tabs)[number];
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SettingsPage() {
  const demo = useDemo();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("Questions");

  return (
    <>
      <PageHeader title="Settings" subtitle="How leads qualify, what we say to them, and when the team is available." />
      <Page>
        <div className="flex gap-1 border-b border-line-soft mb-6">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-3.5 py-2.5 text-[13.5px] font-semibold -mb-px border-b-2", tab === t ? "border-strike text-ink" : "border-transparent text-ash hover:text-ink")}>
              {t}
            </button>
          ))}
        </div>

        {tab === "Questions" && <Questions />}
        {tab === "Message templates" && <Templates />}
        {tab === "Availability" && <Availability />}
        {tab === "Team" && (
          <Card>
            <CardHeader title="Leasing team" subtitle="Who can sign in, and who shows homes" action={<Button variant="secondary" size="sm">Invite</Button>} />
            <ul className="divide-y divide-line-soft">
              {demo.agents.map((a) => (
                <li key={a.id} className="px-5 py-3 flex items-center gap-3">
                  <Avatar initials={a.initials} color={a.color} size={34} />
                  <div className="flex-1">
                    <div className="font-semibold text-ink">{a.name}</div>
                    <div className="text-[12.5px] text-ash">
                      {a.title} · {a.email} · {a.phone}
                    </div>
                  </div>
                  <Badge tone={a.role === "ADMIN" ? "ink" : "neutral"}>{a.role === "ADMIN" ? "Admin" : "Agent"}</Badge>
                  <div className="text-[12.5px] text-ash tabular">{demo.listings.filter((l) => l.agentIds.includes(a.id) && l.status === "ACTIVE").length} homes</div>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {tab === "Rules" && (
          <div className="grid gap-5 xl:grid-cols-2">
            <Card>
              <CardHeader title="Tour rules" />
              <div className="px-5 pb-5 grid gap-4">
                <Field label="Earliest a tour can be booked" hint="Hours from now">
                  <Input type="number" value={demo.settings.minLeadHours} onChange={(e) => demo.updateSettings({ minLeadHours: Number(e.target.value) })} className="max-w-[120px]" />
                </Field>
                <Field label="Release unconfirmed tours" hint="Hours before the start time">
                  <Input type="number" value={demo.settings.confirmDeadlineHours} onChange={(e) => demo.updateSettings({ confirmDeadlineHours: Number(e.target.value) })} className="max-w-[120px]" />
                </Field>
                <Toggle checked={demo.settings.autoCancelUnconfirmed} onChange={(v) => demo.updateSettings({ autoCancelUnconfirmed: v })} label="Automatically release unconfirmed tours" />
              </div>
            </Card>
            <Card>
              <CardHeader title="Self-guided tours" />
              <div className="px-5 pb-5 grid gap-4">
                <Field label="Release the access code" hint="Minutes before the tour">
                  <Input type="number" value={demo.settings.codeReleaseMinutes} onChange={(e) => demo.updateSettings({ codeReleaseMinutes: Number(e.target.value) })} className="max-w-[120px]" />
                </Field>
                <Toggle checked={demo.settings.requireIdForSelfShow} onChange={(v) => demo.updateSettings({ requireIdForSelfShow: v })} label="Require a photo ID before a self-guided tour" />
                <Field label="Quiet hours" hint="Texts queue instead of sending">
                  <div className="flex items-center gap-2 max-w-xs">
                    <Input type="time" value={demo.settings.quietHours.start} onChange={(e) => demo.updateSettings({ quietHours: { ...demo.settings.quietHours, start: e.target.value } })} />
                    <span className="text-ash">to</span>
                    <Input type="time" value={demo.settings.quietHours.end} onChange={(e) => demo.updateSettings({ quietHours: { ...demo.settings.quietHours, end: e.target.value } })} />
                  </div>
                </Field>
              </div>
            </Card>
            <Card>
              <CardHeader title="Applications" />
              <div className="px-5 pb-5">
                <Field label="Application link" hint="Sent after a positive tour. Points at Rent Manager's online application.">
                  <Input value={demo.settings.applicationUrl} onChange={(e) => demo.updateSettings({ applicationUrl: e.target.value })} />
                </Field>
              </div>
            </Card>
          </div>
        )}
      </Page>
      {toast.node}
    </>
  );
}

function Questions() {
  const demo = useDemo();
  const toast = useToast();
  const [setId, setSetId] = useState(demo.prequalSets[0].id);
  const set = demo.prequalSets.find((q) => q.id === setId)!;

  const update = (qid: string, patch: Partial<PrequalQuestion>) => demo.updatePrequalSet(set.id, { ...set, questions: set.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)) });

  return (
    <div className="grid gap-5 xl:grid-cols-[260px_1fr]">
      <div className="space-y-2">
        {demo.prequalSets.map((q) => (
          <button key={q.id} onClick={() => setSetId(q.id)} className={cn("w-full text-left rounded-lg border px-4 py-3", q.id === setId ? "border-ink bg-white shadow-card" : "border-line-soft bg-white/60 hover:bg-white")}>
            <div className="font-semibold text-ink">{q.name}</div>
            <div className="text-[12.5px] text-ash">
              {q.questions.length} questions · used by {demo.listings.filter((l) => l.prequalSetId === q.id).length} homes
            </div>
          </button>
        ))}
        <Button variant="secondary" size="sm" className="w-full">
          New question set
        </Button>
      </div>
      <Card>
        <CardHeader title={set.name} subtitle="Renters answer these before they can see tour times. A failing answer shows the message you write here." action={<Button size="sm" variant="secondary" onClick={() => toast.show("Questions saved")}>Save</Button>} />
        <ol className="divide-y divide-line-soft">
          {set.questions.map((q, i) => (
            <li key={q.id} className="px-5 py-4 grid gap-3 md:grid-cols-[20px_1fr_200px]">
              <span className="text-ash pt-2.5">
                <GripVertical size={16} />
              </span>
              <div className="grid gap-3">
                <Input value={q.prompt} onChange={(e) => update(q.id, { prompt: e.target.value })} className="font-semibold" />
                <div className="grid sm:grid-cols-[140px_1fr] gap-3">
                  <Select value={q.type} onChange={(e) => update(q.id, { type: e.target.value as PrequalQuestion["type"] })}>
                    <option value="YES_NO">Yes / no</option>
                    <option value="SELECT">Pick one</option>
                    <option value="DATE">Date</option>
                    <option value="NUMBER">Number</option>
                    <option value="TEXT">Short answer</option>
                  </Select>
                  {q.type === "SELECT" && <Input value={q.options?.join(", ") ?? ""} onChange={(e) => update(q.id, { options: e.target.value.split(",").map((s) => s.trim()) })} placeholder="Options, comma separated" />}
                  {q.type === "YES_NO" && q.rule && (
                    <Select value={String(q.rule.value)} onChange={(e) => update(q.id, { rule: { op: "eq", value: e.target.value } })}>
                      <option value="Yes">Must answer Yes</option>
                      <option value="No">Must answer No</option>
                    </Select>
                  )}
                  {q.type === "YES_NO" && !q.rule && (
                    <Button size="sm" variant="ghost" className="justify-start" onClick={() => update(q.id, { rule: { op: "eq", value: "Yes" } })}>
                      + Add a pass/fail rule
                    </Button>
                  )}
                  {q.type === "NUMBER" && q.rule && <Input type="number" value={String(q.rule.value)} onChange={(e) => update(q.id, { rule: { op: "lte", value: Number(e.target.value) } })} placeholder="Max" />}
                  {q.type === "DATE" && q.rule && <span className="text-[13px] text-ink-3 self-center">Must be within 90 days</span>}
                </div>
                {q.rule && <Textarea value={q.disqualifyMessage ?? ""} onChange={(e) => update(q.id, { disqualifyMessage: e.target.value })} placeholder="What the renter sees if they don't pass" className="min-h-16 text-[13.5px]" />}
              </div>
              <div className="space-y-2.5 md:pt-1">
                <Toggle checked={q.required} onChange={(v) => update(q.id, { required: v })} label="Required" />
                {q.rule && <Toggle checked={!!q.waitlistOnFail} onChange={(v) => update(q.id, { waitlistOnFail: v })} label="Waitlist instead of decline" />}
                <div className="text-[11.5px] text-smoke">Question {i + 1} of {set.questions.length}</div>
              </div>
            </li>
          ))}
        </ol>
        <div className="px-5 py-4">
          <Button variant="secondary" size="sm">
            + Add question
          </Button>
        </div>
      </Card>
      {toast.node}
    </div>
  );
}

function Templates() {
  const demo = useDemo();
  const toast = useToast();
  const [key, setKey] = useState(demo.templates[0].key);
  const t = demo.templates.find((x) => x.key === key)!;
  const vars = ["first_name", "listing_name", "listing_address", "showing_time", "agent_line", "access_code", "lockbox_location", "confirm_link", "reschedule_link", "schedule_link", "feedback_link", "application_link", "available_on"];
  const preview = t.body
    .replace(/{{first_name}}/g, "Maya")
    .replace(/{{listing_name}}/g, "Urban Exchange Unit 312")
    .replace(/{{listing_address}}/g, "242 East Water Street")
    .replace(/{{showing_time}}/g, "Mon Sep 14, 1:00 PM")
    .replace(/{{agent_line}}/g, "Priya Raman will meet you at the door.")
    .replace(/{{access_code}}/g, "8827")
    .replace(/{{lockbox_location}}/g, "Leasing office key wall, hook 12")
    .replace(/{{available_on}}/g, "Oct 2")
    .replace(/{{(confirm|reschedule|schedule|feedback|application)_link}}/g, "mbx.to/x/8f2k");

  return (
    <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
      <div className="space-y-1.5">
        {demo.templates.map((x) => (
          <button key={x.key} onClick={() => setKey(x.key)} className={cn("w-full text-left rounded-lg border px-4 py-2.5", x.key === key ? "border-ink bg-white shadow-card" : "border-line-soft bg-white/60 hover:bg-white")}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink text-[13.5px]">{x.name}</span>
              <Badge tone={x.channel === "SMS" ? "blue" : "neutral"}>{x.channel === "SMS" ? "Text" : "Email"}</Badge>
            </div>
            <div className="text-[12px] text-ash mt-0.5">{x.trigger}</div>
          </button>
        ))}
      </div>
      <div className="space-y-5">
        <Card>
          <CardHeader title={t.name} subtitle={`Sent automatically when: ${t.trigger.toLowerCase()}`} action={<Button size="sm" variant="secondary" onClick={() => toast.show("Template saved")}>Save</Button>} />
          <div className="px-5 pb-5 grid gap-4">
            {t.channel === "EMAIL" && (
              <Field label="Subject">
                <Input value={t.subject ?? ""} onChange={(e) => demo.updateTemplate(t.key, { subject: e.target.value })} />
              </Field>
            )}
            <Field label="Message" hint={t.channel === "SMS" ? `${t.body.length} characters · ${Math.ceil(t.body.length / 160)} segment${t.body.length > 160 ? "s" : ""}` : undefined}>
              <Textarea value={t.body} onChange={(e) => demo.updateTemplate(t.key, { body: e.target.value })} className="min-h-28 font-mono text-[13px]" />
            </Field>
            <div className="flex flex-wrap gap-1.5">
              {vars.map((v) => (
                <button key={v} type="button" onClick={() => demo.updateTemplate(t.key, { body: `${t.body} {{${v}}}` })} className="rounded-full border border-line bg-white px-2.5 py-1 text-[12px] font-mono text-ink-3 hover:border-ink hover:text-ink">
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Preview" subtitle="As Maya Thornton would receive it" />
          <div className="px-5 pb-5">
            {t.channel === "SMS" ? (
              <div className="max-w-[320px] rounded-2xl bg-sky text-white px-4 py-2.5 text-[14px] leading-relaxed">{preview}</div>
            ) : (
              <div className="rounded-md border border-line-soft">
                <div className="px-4 py-2.5 border-b border-line-soft text-[13.5px] font-bold text-ink">{t.subject?.replace(/{{listing_name}}/g, "Urban Exchange Unit 312").replace(/{{showing_time}}/g, "Mon Sep 14, 1:00 PM")}</div>
                <div className="px-4 py-4 text-[14px] leading-relaxed text-ink-2">{preview}</div>
              </div>
            )}
          </div>
        </Card>
      </div>
      {toast.node}
    </div>
  );
}

function Availability() {
  const demo = useDemo();
  const [agentId, setAgentId] = useState(demo.agents[1].id);
  const agent = demo.agents.find((a) => a.id === agentId)!;
  const rules = demo.availability.filter((r) => r.agentId === agentId);
  const toggleDay = (w: number) => {
    const has = rules.some((r) => r.weekday === w);
    if (has) demo.setAvailability(demo.availability.filter((r) => !(r.agentId === agentId && r.weekday === w)));
    else demo.setAvailability([...demo.availability, { id: `av-${agentId}-${w}-${uid("x")}`, agentId, weekday: w, start: "10:00", end: "17:00", slotMinutes: 30 }]);
  };
  const setTime = (id: string, patch: { start?: string; end?: string }) => demo.setAvailability(demo.availability.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div className="grid gap-5 xl:grid-cols-[260px_1fr]">
      <div className="space-y-2">
        {demo.agents.map((a) => (
          <button key={a.id} onClick={() => setAgentId(a.id)} className={cn("w-full text-left rounded-lg border px-4 py-3 flex items-center gap-3", a.id === agentId ? "border-ink bg-white shadow-card" : "border-line-soft bg-white/60 hover:bg-white")}>
            <Avatar initials={a.initials} color={a.color} size={30} />
            <div>
              <div className="font-semibold text-ink text-[14px]">{a.name}</div>
              <div className="text-[12px] text-ash">{demo.availability.filter((r) => r.agentId === a.id).length} days / week</div>
            </div>
          </button>
        ))}
      </div>
      <Card>
        <CardHeader title={`${agent.name}'s tour hours`} subtitle="Renters only see times inside these windows. Tours are 30 minutes with no buffer." />
        <ul className="px-5 pb-5 divide-y divide-line-soft">
          {weekdays.map((d, w) => {
            const r = rules.find((x) => x.weekday === w);
            return (
              <li key={d} className="py-3 flex items-center gap-4">
                <Toggle checked={!!r} onChange={() => toggleDay(w)} />
                <span className="w-10 font-semibold text-ink">{d}</span>
                {r ? (
                  <div className="flex items-center gap-2">
                    <Input type="time" value={r.start} onChange={(e) => setTime(r.id, { start: e.target.value })} className="w-[130px]" />
                    <span className="text-ash">to</span>
                    <Input type="time" value={r.end} onChange={(e) => setTime(r.id, { end: e.target.value })} className="w-[130px]" />
                  </div>
                ) : (
                  <span className="text-[13.5px] text-smoke">Not showing</span>
                )}
              </li>
            );
          })}
        </ul>
        <div className="px-5 pb-5 text-[12.5px] text-ash">Self-guided tour windows are set per home on the listing page. Blackout dates and Google Calendar sync come with the full build.</div>
      </Card>
    </div>
  );
}
