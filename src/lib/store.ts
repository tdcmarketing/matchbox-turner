"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  agents as seedAgents,
  availability as seedAvailability,
  DEMO_TODAY,
  leads as seedLeads,
  listings as seedListings,
  lockboxes as seedLockboxes,
  messages as seedMessages,
  prequalSets as seedPrequalSets,
  properties as seedProperties,
  rmUnitsFixture,
  settings as seedSettings,
  showings as seedShowings,
  templates as seedTemplates,
} from "./data/seed";
import type {
  Agent,
  AvailabilityRule,
  Lead,
  LeadSource,
  Listing,
  Lockbox,
  Message,
  MessageTemplate,
  PrequalAnswer,
  PrequalSet,
  Property,
  Settings,
  Showing,
  SyncRun,
} from "./data/types";
import { evaluateAnswers } from "./prequal";
import { fmtDateTime } from "./format";

export interface DemoState {
  // data
  agents: Agent[];
  properties: Property[];
  listings: Listing[];
  leads: Lead[];
  showings: Showing[];
  lockboxes: Lockbox[];
  messages: Message[];
  templates: MessageTemplate[];
  prequalSets: PrequalSet[];
  availability: AvailabilityRule[];
  settings: Settings;
  syncRuns: SyncRun[];
  // demo controls
  clockOffsetMs: number; // added to the demo "today"
  currentAgentId: string;
  hydrated: boolean;

  now: () => Date;
  setClockOffset: (ms: number) => void;
  jumpClockTo: (iso: string) => void;
  resetDemo: () => void;
  setHydrated: () => void;

  createLead: (input: {
    listingId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    source?: LeadSource;
    consentSms: boolean;
    answers: PrequalAnswer[];
    moveInDate?: string;
  }) => Lead;
  updateLead: (id: string, patch: Partial<Lead>) => void;

  bookShowing: (input: { leadId: string; listingId: string; type: "AGENT" | "SELF"; startsAt: string; agentId?: string }) => Showing;
  confirmShowing: (id: string) => void;
  cancelShowing: (id: string, reason?: "lead" | "staff" | "unconfirmed") => void;
  rescheduleShowing: (id: string, startsAt: string, agentId?: string) => void;
  markShowing: (id: string, status: "NO_SHOW" | "COMPLETED") => void;
  releaseCode: (id: string) => string | undefined;
  checkIn: (id: string) => void;
  checkOut: (id: string) => void;
  submitFeedback: (id: string, feedback: { rating: number; interested: boolean; comments?: string }) => void;

  updateListing: (id: string, patch: Partial<Listing>) => void;
  createListing: (input: Partial<Listing> & { propertyId: string; unitLabel: string }) => Listing;

  updateLockbox: (id: string, patch: Partial<Lockbox>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  updateTemplate: (key: string, patch: Partial<MessageTemplate>) => void;
  updatePrequalSet: (id: string, set: PrequalSet) => void;
  setAvailability: (rules: AvailabilityRule[]) => void;

  sendMessage: (m: Omit<Message, "id" | "at" | "status"> & { status?: Message["status"] }) => Message;
  runRmSync: () => SyncRun;
}

let counter = 100;
export const uid = (p: string) => `${p}-${Date.now().toString(36)}${(counter++).toString(36)}`;

function seedState() {
  return {
    agents: seedAgents,
    properties: seedProperties,
    listings: seedListings,
    leads: seedLeads,
    showings: seedShowings,
    lockboxes: seedLockboxes,
    messages: seedMessages,
    templates: seedTemplates,
    prequalSets: seedPrequalSets,
    availability: seedAvailability,
    settings: seedSettings,
    syncRuns: [] as SyncRun[],
    clockOffsetMs: 0,
    currentAgentId: "a-kelsey",
  };
}

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => ({
      ...seedState(),
      hydrated: false,

      now: () => new Date(new Date(DEMO_TODAY).getTime() + get().clockOffsetMs),
      setClockOffset: (ms) => set({ clockOffsetMs: ms }),
      jumpClockTo: (iso) => set({ clockOffsetMs: new Date(iso).getTime() - new Date(DEMO_TODAY).getTime() }),
      resetDemo: () => set({ ...seedState() }),
      setHydrated: () => set({ hydrated: true }),

      createLead: (input) => {
        const s = get();
        const listing = s.listings.find((l) => l.id === input.listingId)!;
        const property = s.properties.find((p) => p.id === listing.propertyId)!;
        const set_ = s.prequalSets.find((q) => q.id === listing.prequalSetId)!;
        const result = evaluateAnswers(set_, input.answers);
        const offMarket = listing.status !== "ACTIVE" || listing.showingMode === "NONE";
        const status: Lead["status"] = offMarket
          ? "WAITLIST"
          : result.outcome === "PASS"
            ? "QUALIFIED"
            : result.outcome === "WAITLIST"
              ? "WAITLIST"
              : "DISQUALIFIED";
        const lead: Lead = {
          id: uid("ld"),
          listingId: input.listingId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          source: input.source ?? "WEB",
          status,
          moveInDate: input.moveInDate,
          consentSms: input.consentSms,
          createdAt: s.now().toISOString(),
          answers: input.answers,
        };
        set({ leads: [lead, ...s.leads] });
        if (status === "QUALIFIED" && input.consentSms) {
          get().sendMessage({
            leadId: lead.id,
            channel: "SMS",
            direction: "OUT",
            to: lead.phone,
            templateKey: "LEAD_INSTANT_REPLY",
            body: `Hi ${lead.firstName}, this is Matchbox Realty. Thanks for your interest in ${property.name} ${listing.unitLabel}. Pick a tour time here: mbx.to/t/${lead.id.slice(-4)}. Reply STOP to opt out.`,
          });
        }
        return lead;
      },
      updateLead: (id, patch) => set({ leads: get().leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) }),

      bookShowing: ({ leadId, listingId, type, startsAt, agentId }) => {
        const s = get();
        const listing = s.listings.find((l) => l.id === listingId)!;
        const property = s.properties.find((p) => p.id === listing.propertyId)!;
        const lead = s.leads.find((l) => l.id === leadId)!;
        const start = new Date(startsAt);
        const end = new Date(start.getTime() + 30 * 60000);
        const showing: Showing = {
          id: uid("sh"),
          listingId,
          leadId,
          agentId: type === "AGENT" ? agentId ?? listing.agentIds[0] : undefined,
          type,
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          status: "REQUESTED",
          createdAt: s.now().toISOString(),
        };
        set({
          showings: [showing, ...s.showings],
          leads: s.leads.map((l) => (l.id === leadId ? { ...l, status: "SCHEDULED" } : l)),
        });
        get().sendMessage({
          leadId,
          showingId: showing.id,
          channel: "SMS",
          direction: "OUT",
          to: lead.phone,
          templateKey: "SHOWING_CONFIRM_REQUEST",
          body: `${lead.firstName}, your tour of ${property.name} ${listing.unitLabel} is requested for ${fmtDateTime(showing.startsAt)}. Reply C to confirm or tap mbx.to/c/${showing.id.slice(-4)}. Unconfirmed tours are released 12 hours before.`,
        });
        return showing;
      },
      confirmShowing: (id) => {
        const s = get();
        const sh = s.showings.find((x) => x.id === id);
        if (!sh) return;
        const listing = s.listings.find((l) => l.id === sh.listingId)!;
        const property = s.properties.find((p) => p.id === listing.propertyId)!;
        const lead = s.leads.find((l) => l.id === sh.leadId)!;
        const agent = sh.agentId ? s.agents.find((a) => a.id === sh.agentId) : undefined;
        set({
          showings: s.showings.map((x) => (x.id === id ? { ...x, status: "CONFIRMED", confirmedAt: s.now().toISOString() } : x)),
        });
        get().sendMessage({
          leadId: lead.id,
          showingId: id,
          channel: "EMAIL",
          direction: "OUT",
          to: lead.email,
          templateKey: "SHOWING_CONFIRMED",
          subject: `You're confirmed: ${property.name} ${listing.unitLabel} on ${fmtDateTime(sh.startsAt)}`,
          body: `Thanks ${lead.firstName}. You're confirmed for ${fmtDateTime(sh.startsAt)} at ${property.address}. ${
            agent ? `${agent.name} will meet you at the door.` : "This is a self-guided tour; your access code arrives 15 minutes before."
          } Need to change it? mbx.to/r/${id.slice(-4)}`,
        });
      },
      cancelShowing: (id, reason = "lead") => {
        const s = get();
        const sh = s.showings.find((x) => x.id === id);
        if (!sh) return;
        const status: Showing["status"] = reason === "unconfirmed" ? "UNCONFIRMED_CANCELLED" : "CANCELLED";
        set({
          showings: s.showings.map((x) => (x.id === id ? { ...x, status } : x)),
          leads: s.leads.map((l) => (l.id === sh.leadId && l.status === "SCHEDULED" ? { ...l, status: "QUALIFIED" } : l)),
        });
        const lead = s.leads.find((l) => l.id === sh.leadId)!;
        const listing = s.listings.find((l) => l.id === sh.listingId)!;
        const property = s.properties.find((p) => p.id === listing.propertyId)!;
        get().sendMessage({
          leadId: lead.id,
          showingId: id,
          channel: "SMS",
          direction: "OUT",
          to: lead.phone,
          templateKey: reason === "unconfirmed" ? "UNCONFIRMED_CANCELLED" : undefined,
          body:
            reason === "unconfirmed"
              ? `We didn't hear back, so we released your ${fmtDateTime(sh.startsAt)} tour of ${property.name} ${listing.unitLabel}. Still interested? Rebook here: mbx.to/t/${lead.id.slice(-4)}`
              : `Your ${fmtDateTime(sh.startsAt)} tour of ${property.name} ${listing.unitLabel} is cancelled. Book another time any time: mbx.to/t/${lead.id.slice(-4)}`,
        });
      },
      rescheduleShowing: (id, startsAt, agentId) => {
        const s = get();
        const start = new Date(startsAt);
        const end = new Date(start.getTime() + 30 * 60000);
        set({
          showings: s.showings.map((x) =>
            x.id === id
              ? { ...x, startsAt: start.toISOString(), endsAt: end.toISOString(), agentId: agentId ?? x.agentId, status: "CONFIRMED", confirmedAt: s.now().toISOString() }
              : x,
          ),
        });
        const sh = get().showings.find((x) => x.id === id)!;
        const lead = s.leads.find((l) => l.id === sh.leadId)!;
        const listing = s.listings.find((l) => l.id === sh.listingId)!;
        const property = s.properties.find((p) => p.id === listing.propertyId)!;
        get().sendMessage({
          leadId: lead.id,
          showingId: id,
          channel: "SMS",
          direction: "OUT",
          to: lead.phone,
          body: `Moved: your tour of ${property.name} ${listing.unitLabel} is now ${fmtDateTime(sh.startsAt)}. You're confirmed.`,
        });
      },
      markShowing: (id, status) => {
        const s = get();
        const sh = s.showings.find((x) => x.id === id);
        if (!sh) return;
        set({
          showings: s.showings.map((x) => (x.id === id ? { ...x, status } : x)),
          leads: s.leads.map((l) => (l.id === sh.leadId && status === "COMPLETED" ? { ...l, status: "TOURED" } : l)),
        });
      },
      releaseCode: (id) => {
        const s = get();
        const sh = s.showings.find((x) => x.id === id);
        if (!sh) return;
        if (sh.accessCode) return sh.accessCode;
        const listing = s.listings.find((l) => l.id === sh.listingId)!;
        const property = s.properties.find((p) => p.id === listing.propertyId)!;
        const box = s.lockboxes.find((b) => b.id === listing.lockboxId);
        if (!box) return;
        const code = box.codePool.find((c) => !box.usedCodes.includes(c)) ?? box.codePool[0];
        const lead = s.leads.find((l) => l.id === sh.leadId)!;
        set({
          showings: s.showings.map((x) => (x.id === id ? { ...x, accessCode: code, codeReleasedAt: s.now().toISOString() } : x)),
          lockboxes: s.lockboxes.map((b) => (b.id === box.id ? { ...b, usedCodes: [...b.usedCodes, code] } : b)),
        });
        get().sendMessage({
          leadId: lead.id,
          showingId: id,
          channel: "SMS",
          direction: "OUT",
          to: lead.phone,
          templateKey: "SELF_SHOW_ACCESS",
          body: `Your access code for ${property.name} ${listing.unitLabel} is ${code}. Lockbox: ${box.location}. Open your tour page to check in: mbx.to/a/${id.slice(-4)}. Please lock up and return the key when you leave.`,
        });
        return code;
      },
      checkIn: (id) => {
        const s = get();
        set({ showings: s.showings.map((x) => (x.id === id ? { ...x, checkedInAt: s.now().toISOString() } : x)) });
      },
      checkOut: (id) => {
        const s = get();
        const sh = s.showings.find((x) => x.id === id)!;
        set({
          showings: s.showings.map((x) => (x.id === id ? { ...x, checkedOutAt: s.now().toISOString(), status: "COMPLETED" } : x)),
          leads: s.leads.map((l) => (l.id === sh.leadId ? { ...l, status: "TOURED" } : l)),
        });
        const lead = s.leads.find((l) => l.id === sh.leadId)!;
        const listing = s.listings.find((l) => l.id === sh.listingId)!;
        const property = s.properties.find((p) => p.id === listing.propertyId)!;
        get().sendMessage({
          leadId: lead.id,
          showingId: id,
          channel: "SMS",
          direction: "OUT",
          to: lead.phone,
          templateKey: "FEEDBACK_REQUEST",
          body: `Thanks for touring ${property.name} ${listing.unitLabel}, ${lead.firstName}. How was it? mbx.to/f/${id.slice(-4)}`,
        });
      },
      submitFeedback: (id, feedback) => {
        const s = get();
        const sh = s.showings.find((x) => x.id === id)!;
        set({
          showings: s.showings.map((x) => (x.id === id ? { ...x, feedback: { ...feedback, at: s.now().toISOString() }, status: "COMPLETED" } : x)),
          leads: s.leads.map((l) => (l.id === sh.leadId && (l.status === "SCHEDULED" || l.status === "QUALIFIED") ? { ...l, status: "TOURED" } : l)),
        });
        if (feedback.interested) {
          const lead = s.leads.find((l) => l.id === sh.leadId)!;
          const listing = s.listings.find((l) => l.id === sh.listingId)!;
          const property = s.properties.find((p) => p.id === listing.propertyId)!;
          get().sendMessage({
            leadId: lead.id,
            showingId: id,
            channel: "EMAIL",
            direction: "OUT",
            to: lead.email,
            templateKey: "APPLY_NUDGE",
            subject: `Ready to make ${property.name} ${listing.unitLabel} home?`,
            body: `Glad you liked it, ${lead.firstName}. Apply in about 10 minutes here: ${s.settings.applicationUrl}. Applications are reviewed in the order received.`,
          });
        }
      },

      updateListing: (id, patch) => set({ listings: get().listings.map((l) => (l.id === id ? { ...l, ...patch } : l)) }),
      createListing: (input) => {
        const s = get();
        const property = s.properties.find((p) => p.id === input.propertyId)!;
        const slug = `${property.name}-${input.unitLabel}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const listing: Listing = {
          id: uid("l"),
          slug,
          status: "DRAFT",
          rent: 0,
          deposit: 0,
          beds: 1,
          baths: 1,
          sqft: 0,
          availableOn: s.now().toISOString().slice(0, 10),
          leaseTermMonths: 12,
          headline: "",
          description: "",
          amenities: [],
          photos: [],
          showingMode: "AGENT",
          agentIds: [],
          syndicate: false,
          source: "MANUAL",
          prequalSetId: s.settings.defaultPrequalSetId,
          createdAt: s.now().toISOString(),
          views: 0,
          pets: "CASE_BY_CASE",
          ...input,
        };
        set({ listings: [listing, ...s.listings] });
        return listing;
      },

      updateLockbox: (id, patch) => set({ lockboxes: get().lockboxes.map((b) => (b.id === id ? { ...b, ...patch } : b)) }),
      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
      updateTemplate: (key, patch) => set({ templates: get().templates.map((t) => (t.key === key ? { ...t, ...patch } : t)) }),
      updatePrequalSet: (id, next) => set({ prequalSets: get().prequalSets.map((q) => (q.id === id ? next : q)) }),
      setAvailability: (rules) => set({ availability: rules }),

      sendMessage: (m) => {
        const s = get();
        const msg: Message = { id: uid("m"), at: s.now().toISOString(), status: m.status ?? "SENT", ...m };
        set({ messages: [msg, ...s.messages] });
        return msg;
      },

      runRmSync: () => {
        const s = get();
        const started = s.now();
        const notes: string[] = [];
        let created = 0;
        let updated = 0;
        let skipped = 0;
        let leasedDetected = 0;
        let prospectsPushed = 0;
        let listings = [...s.listings];
        for (const u of rmUnitsFixture) {
          const existing = listings.find((l) => l.rmUnitId === u.UnitID);
          const property = s.properties.find((p) => p.rmPropertyId === u.PropertyID);
          if (!property) {
            skipped++;
            notes.push(`Skipped unit ${u.Name}: property ${u.PropertyID} not mapped.`);
            continue;
          }
          if (existing) {
            if (!u.IsVacant && existing.status === "ACTIVE") {
              listings = listings.map((l) => (l.id === existing.id ? { ...l, status: "LEASED" } : l));
              leasedDetected++;
              notes.push(`${property.name} ${existing.unitLabel}: Rent Manager shows occupied. Marked Leased and pulled from syndication.`);
            } else if (u.MarketRent !== existing.rent) {
              listings = listings.map((l) => (l.id === existing.id ? { ...l, rent: u.MarketRent } : l));
              updated++;
              notes.push(`${property.name} ${existing.unitLabel}: rent updated $${existing.rent} → $${u.MarketRent}.`);
            } else {
              skipped++;
            }
          } else {
            const slug = `${property.name}-${u.Name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            listings.unshift({
              id: uid("l"),
              propertyId: property.id,
              rmUnitId: u.UnitID,
              slug,
              unitLabel: `Unit ${u.Name}`,
              status: "DRAFT",
              rent: u.MarketRent,
              deposit: u.MarketRent,
              beds: u.Bedrooms,
              baths: u.Bathrooms,
              sqft: u.SquareFootage,
              availableOn: u.AvailableDate,
              leaseTermMonths: 12,
              headline: `${u.Bedrooms === 0 ? "Studio" : `${u.Bedrooms}-bedroom`} at ${property.name}`,
              description: u.Comment,
              amenities: u.Amenities,
              photos: property.id === "p-urban" ? ["/photos/urban-exchange-1.jpg"] : ["/photos/ice-house-1.jpg"],
              showingMode: "AGENT",
              agentIds: ["a-kelsey"],
              syndicate: false,
              source: "RENT_MANAGER",
              prequalSetId: s.settings.defaultPrequalSetId,
              createdAt: started.toISOString(),
              views: 0,
              pets: "CASE_BY_CASE",
            });
            created++;
            notes.push(`Created draft listing for ${property.name} Unit ${u.Name} (available ${u.AvailableDate}).`);
          }
        }
        const leads = s.leads.map((l) => {
          if (!l.rmProspectId && ["QUALIFIED", "SCHEDULED", "TOURED"].includes(l.status)) {
            prospectsPushed++;
            return { ...l, rmProspectId: 88300 + prospectsPushed };
          }
          return l;
        });
        if (prospectsPushed) notes.push(`Pushed ${prospectsPushed} qualified lead${prospectsPushed === 1 ? "" : "s"} to Rent Manager as Prospects.`);
        const run: SyncRun = {
          id: uid("sync"),
          startedAt: started.toISOString(),
          finishedAt: new Date(started.getTime() + 2400).toISOString(),
          created,
          updated,
          skipped,
          leasedDetected,
          prospectsPushed,
          notes,
        };
        set({ listings, leads, syncRuns: [run, ...s.syncRuns] });
        return run;
      },
    }),
    {
      name: "matchbox-turner-demo-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => {
        const rest = { ...s };
        delete (rest as Partial<DemoState>).hydrated;
        return rest;
      },
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
