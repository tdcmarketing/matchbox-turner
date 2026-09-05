"use client";

import { useState } from "react";
import { useDemo } from "@/lib/store";
import { Page, PageHeader } from "@/components/staff/Shell";
import { Badge, Card, Select } from "@/components/ui";
import { LeadLink } from "@/components/staff/bits";
import { fmtAgo, fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ArrowDownLeft, ArrowUpRight, Mail, MessageSquareText } from "lucide-react";

export default function MessagesPage() {
  const demo = useDemo();
  const now = demo.now();
  const [channel, setChannel] = useState<"ALL" | "SMS" | "EMAIL">("ALL");
  const [selected, setSelected] = useState<string | null>(null);
  const rows = demo.messages.filter((m) => channel === "ALL" || m.channel === channel).sort((a, b) => b.at.localeCompare(a.at));
  const sel = rows.find((m) => m.id === selected) ?? rows[0];

  const statusTone = { QUEUED: "amber", SENT: "blue", DELIVERED: "green", FAILED: "red" } as const;

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Every text and email the system sent or received. Automatic messages are marked with their template."
        action={
          <Select value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)} className="w-[140px]">
            <option value="ALL">Texts and email</option>
            <option value="SMS">Texts</option>
            <option value="EMAIL">Email</option>
          </Select>
        }
      />
      <Page>
        <div className="grid gap-4 xl:grid-cols-[1fr_440px]">
          <Card>
            <ul className="divide-y divide-line-soft">
              {rows.map((m) => {
                const lead = m.leadId ? demo.leads.find((l) => l.id === m.leadId) : undefined;
                const tpl = m.templateKey ? demo.templates.find((t) => t.key === m.templateKey) : undefined;
                return (
                  <li key={m.id}>
                    <button onClick={() => setSelected(m.id)} className={cn("w-full text-left px-5 py-3 flex items-start gap-3 hover:bg-paper-2", sel?.id === m.id && "bg-paper-2")}>
                      <span className={cn("mt-0.5 size-7 rounded-full flex items-center justify-center shrink-0", m.direction === "IN" ? "bg-leaf-soft text-[#3f6f18]" : "bg-paper text-ink-3")}>
                        {m.direction === "IN" ? <ArrowDownLeft size={14} /> : m.channel === "SMS" ? <MessageSquareText size={14} /> : <Mail size={14} />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="font-semibold text-ink text-[14px]">{lead ? `${lead.firstName} ${lead.lastName}` : m.to}</span>
                          {tpl && <span className="text-[11.5px] font-semibold text-ash uppercase tracking-wide">{tpl.name}</span>}
                          {!tpl && m.direction === "OUT" && <span className="text-[11.5px] font-semibold text-sky uppercase tracking-wide">Manual</span>}
                        </span>
                        <span className="block text-[13px] text-ink-3 truncate">{m.subject ?? m.body}</span>
                      </span>
                      <span className="text-right shrink-0">
                        <Badge tone={statusTone[m.status]}>{m.status.toLowerCase()}</Badge>
                        <span className="block text-[11.5px] text-ash mt-1">{fmtAgo(m.at, now)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {sel && (
            <Card className="self-start sticky top-6">
              <div className="px-5 pt-4 pb-3 border-b border-line-soft">
                <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-ash">
                  {sel.direction === "IN" ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                  {sel.direction === "IN" ? "Received" : "Sent"} · {sel.channel === "SMS" ? "Text" : "Email"}
                </div>
                <div className="mt-1 font-bold text-ink">
                  {sel.leadId ? <LeadLink id={sel.leadId}>{`${demo.leads.find((l) => l.id === sel.leadId)?.firstName} ${demo.leads.find((l) => l.id === sel.leadId)?.lastName}`}</LeadLink> : sel.to}
                </div>
                <div className="text-[12.5px] text-ash">
                  {sel.direction === "IN" ? "from" : "to"} {sel.to} · {fmtDateTime(sel.at)}
                </div>
              </div>
              <div className="p-5">
                {sel.channel === "SMS" ? (
                  <div className={cn("max-w-[300px] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed", sel.direction === "IN" ? "bg-paper text-ink" : "bg-sky text-white ml-auto")}>{sel.body}</div>
                ) : (
                  <div className="rounded-md border border-line-soft">
                    <div className="px-4 py-2.5 border-b border-line-soft text-[13.5px] font-bold text-ink">{sel.subject}</div>
                    <div className="px-4 py-4 text-[14px] leading-relaxed text-ink-2">{sel.body}</div>
                  </div>
                )}
                {sel.status === "FAILED" && <div className="mt-4 rounded-md bg-strike-soft p-3 text-[13px] text-strike-deep">Carrier rejected the message: number is not opted in. Retry by email or call.</div>}
                {sel.templateKey && (
                  <div className="mt-4 text-[12.5px] text-ash">
                    Sent automatically by <span className="font-semibold text-ink-3">{demo.templates.find((t) => t.key === sel.templateKey)?.name}</span>. Edit wording under Settings → Message templates.
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </Page>
    </>
  );
}
