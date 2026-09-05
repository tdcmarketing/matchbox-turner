# Matchbox Turner

Leasing automation for Matchbox Realty, modeled on Tenant Turner. This is the **demo MVP**: a complete front end running on sample data, with the plumbing (database, Twilio, Resend, Rent Manager API) stubbed so the whole product can be walked through in a browser.

## Staging site

https://tdcmarketing.github.io/matchbox-turner/

Deploys automatically from `main` via GitHub Actions (static export, `NEXT_PUBLIC_BASE_PATH=/matchbox-turner`). The top bar on every page jumps between the staff app, renter site, simulated Rent Manager, notes, and the sign-in screen.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

- `/` demo launcher
- `/listings` what renters see
- `/app` what the leasing team sees (no login required in the demo; `/login` shows the sign-in screen)
- `/app/settings/rent-manager` the Rent Manager integration map and the open questions for Matchbox
- `/rm` a simulated Rent Manager window showing the Prospects, History/Notes, and unit statuses that Turner writes back (what Matchbox staff would see)

## How the demo works

All data lives in `src/lib/data/seed.ts` and is loaded into a browser-side store (`src/lib/store.ts`) that persists to `localStorage`. Everything you do in the demo (book a tour, confirm it, check in, run a sync) updates that store, so the staff app reflects what the renter did and vice versa.

- **Demo clock.** The seed data is anchored to Monday, September 14, 2026. The clock button at the bottom of the staff sidebar moves time forward so you can show a self-guided tour unlocking without waiting.
- **Reset.** Same dialog, "Reset demo data" returns everything to the seed.
- **Messages.** Texts and emails are not actually sent. Every message the system would have sent appears under Messages in the staff app, with the template that produced it.

## Demo script (about 8 minutes)

1. Start at `/listings`. Filter to self-guided tours. Open Urban Exchange Unit 312.
2. Click **Schedule a tour**. Enter a name and phone. On the questions, answer "Yes" to smoking to show the polite decline. Go back and answer "No".
3. Pick **Self-guided**, choose a time later today. Land on the "Tour requested" page and click **Confirm this tour**.
4. Switch to `/app`. The tour is on Today's tours and the calendar. Open Messages to show the confirmation text and email that went out.
5. Open the demo clock. Jump to "…self-guided tour, 14 min before". Go back to the renter's tour page: the red **Get your access code** card is live. Open it, show the code and lockbox location, tap **I'm inside**.
6. Back in `/app`: "Inside a home right now" shows the renter. Lockboxes shows the code consumed.
7. Tap **Check out** on the renter side, then leave 5-star feedback and "Yes, send me the application". Show the apply email in Messages and the lead now marked Toured.
8. Open **Rent Manager** in the sidebar. Click **Sync now**. Two new draft listings appear, one rent changes, Metro Unit 7 flips to Leased because RM shows a lease signed. Walk through the sync flows and the open questions.
9. Click **What Matchbox sees in RM**. The simulated Rent Manager window shows the new Prospect, every tour event on its History/Notes tab, and the unit list Turner reads from.
10. Finish on Reports.

## What's real vs. stubbed

| Real in the demo | Stubbed |
|---|---|
| Every screen, flow, and state change | Database (browser storage instead) |
| Pre-qualification rules and slot generation | Sending SMS and email |
| Confirm / cancel / reschedule / check-in / feedback logic | Rent Manager API (fixture-backed fake) |
| Lockbox code pools | Login (any email works) |
| Rent Manager sync behavior | ILS feeds, photo upload |

## Stack

Next.js 16, React 19, TypeScript, Tailwind 4, zustand, date-fns, lucide-react. No backend yet by design.

## Full build plan

The roadmap after client approval (Postgres/Prisma, Twilio, Resend, real Rent Manager sync, Zillow feed, owner reports) is in `~/.claude/plans/linked-humming-seahorse.md` and summarized on the Rent Manager page in the app.
