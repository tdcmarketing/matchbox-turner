# Rent Manager and Matchbox Turner: integration brief and questions for Brian

Prepared for the Matchbox Realty meeting, week of September 14, 2026. The same content is in the demo app under Rent Manager.

## What Rent Manager already does (so we don't rebuild it)

Matchbox runs Rent Manager Online (RMO) for resident and owner portals, work orders, and applications. On the leasing side, RM ships with:

- **Guest Cards.** A lead form for the website that creates a Prospect record.
- **Prospect Manager / CRM.** Prospect records, statuses, notes, and reports.
- **ILS advertising.** Pushes units to Zillow, Apartments.com, Zumper, Apartment List, and Rent.com, and keeps them in sync when RM data changes.
- **Online applications and Signable Documents.** Application templates, application fees, eSignature.
- **AmRent screening.** Credit, criminal, and eviction checks from inside RM.
- **Communication.** Web Chat on the website, Texting and Text Broadcast, Phone Broadcast, and rmVoIP with call recording attached to the contact.
- **Prospect & Tenant Portal and Resident App.**
- **Letter templates** with merge fields.
- **Open API** (read and write) and **Open Access** (read-only database views). API access is enabled per customer by LCS and may carry a fee.

## What Rent Manager does not do

Rent Manager stops at the Guest Card. It does not:

- ask pre-qualification questions and turn away or waitlist leads automatically,
- let a prospect book a tour against an agent's calendar,
- send confirm/remind/cancel texts with reply handling (C, CANCEL, STOP),
- release unconfirmed tour slots,
- hand out a one-time lockbox code for a self-guided tour and record check-in and check-out,
- collect tour feedback and nudge the application,
- notify a waitlist when a unit relists,
- produce a lead-to-lease funnel by source and by home.

That gap is what Tenant Turner sells, and what Matchbox Turner fills.

## Proposed data flows

| Direction | What | Why | RM API | Status |
|---|---|---|---|---|
| RM → Turner | Properties and vacant or notice-given units | Draft listings with rent, beds/baths, sqft, available date pre-filled | `GET /Properties`, `GET /Units` | In demo |
| RM → Turner | Marketing copy and photos | No double entry if Matchbox keeps them in RM | `GET /Units/{id}/Marketing`, `/Images` | Ask Brian |
| RM → Turner | Unit leased | Flip listing to Leased, stop tours, drop from syndication | Nightly diff on `IsVacant` / Leases | In demo |
| Turner → RM | Qualified lead becomes a Prospect | RM stays the system of record | `POST /Prospects` | In demo |
| Turner → RM | Tour history to Prospect notes | Confirmations, tours, no-shows, feedback on the RM record | `POST /History` | In demo |
| Turner → RM | Application handoff | Apply link opens RM's application with prospect and unit pre-selected; screening and eSign stay in RM | Portal deep link | Ask Brian |
| RM → Turner | Guest Card and Web Chat leads | Leads from RM's own forms enter the same text-and-book flow | `GET /Prospects?since=` | Ask Brian |
| Both | Texting | Tour texts need a dedicated 10DLC-registered number with reply handling; decide whether to log them to RM | Twilio + `POST /History` | Ask Brian |

## Questions for Brian

### 1. Access
- Is the Rent Manager API add-on enabled on Matchbox's RMO database? If not, who at LCS turns it on and what does it cost?
- Can we get a sandbox or a read-only API user first, before write access to Prospects?
- Does Matchbox already use Open Access (read-only DB views)? That would let us do reporting without touching the API.

### 2. How Matchbox uses RM today
- Where does "this unit is available" get decided: a status on the unit, the lease end date, or the make-ready board?
- Are unit descriptions, amenities, and photos maintained in RM's marketing fields, on the website, or both?
- Is RM's ILS syndication turned on for all properties, or only some?
- Which RM modules are licensed: Prospect Manager, Web Chat, Texting, rmVoIP, Signable Documents, AmRent screening?
- Student housing is leased by the bed with guarantors. How is that modeled in RM: one unit with multiple leases, or one unit per bed?

### 3. Leads and prospects
- Where do ILS leads land right now: Guest Cards in RM, a shared inbox, or the ILS's own dashboard?
- Who is expected to respond to a new lead, and how fast? What happens on nights and weekends?
- Do you want every lead in RM as a Prospect, or only qualified ones?
- Which Prospect fields and statuses do you use, so we mirror them instead of inventing our own?

### 4. Tours and access
- How are showings scheduled today, and who has keys? Is there a key log?
- Which homes would you be comfortable opening for self-guided tours first: vacant units only, downtown only, student only?
- Any lockboxes already in use? Brand, and how codes are managed.
- Should a self-guided tour require a photo ID upload, a hold on a card, or just a confirmed phone number?

### 5. Applications and screening
- The apply link points at RM's online application. Can that link pre-select the unit and prospect?
- Is PetScreening triggered from RM or separately? We can prompt it right after tour feedback when the lead has a pet.
- Do you want Matchbox Turner to know when an application is submitted or approved so the lead's status updates without anyone touching it?

### 6. Reporting
- Do owners get a leasing report today? From RM, or a spreadsheet? What's on it?
- Which numbers matter most: days to lease, lead source ROI, no-show rate, tours per lease?

## Where this beats the off-the-shelf option

- **No duplicate data entry.** Units come from RM; qualified leads go back as Prospects with the full tour story in Notes. Staff keep working in RM.
- **Syndication stays in RM.** We don't rebuild it; we make sure the leads those sites generate get answered in under a minute.
- **Bed-level leasing for JMU.** Tenant Turner is unit-centric. Group tours, guarantors, and per-bed pricing are first-class here because Charleston Townes and Devon Lane need them.
- **Owner and lockbox reporting.** Every tour, code, check-in, and no-show is a record. That becomes the owner report and the answer to "who was in the unit Tuesday?"
- **Matchbox owns it.** No per-listing fee, no hardware markup, and the roadmap follows Matchbox's leasing calendar.

## Notes on the Rent Manager API (to confirm with LCS)

REST/JSON at `https://{corp}.api.rentmanager.com/`. `POST /Authentication/AuthorizeUser` returns a token sent on every request as `X-RM12Api-ApiToken`. Resources we expect to use: `/Properties`, `/Units`, `/UnitTypes`, `/Prospects`, `/Contacts`, `/History`. The API is enabled per customer database by LCS; a partner listing in the Rent Manager Integrations Program is optional but helps with support.
