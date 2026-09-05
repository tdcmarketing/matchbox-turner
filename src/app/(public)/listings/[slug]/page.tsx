"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { useDemo } from "@/lib/store";
import { Hydrated } from "@/components/Hydrated";
import { Badge, Button, Eyebrow } from "@/components/ui";
import { baths, beds, fmtDateLong, money } from "@/lib/format";
import { Check, Clock, KeyRound, MapPin, PawPrint, UserRound } from "lucide-react";

export default function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <Hydrated>
      <Detail slug={slug} />
    </Hydrated>
  );
}

function Detail({ slug }: { slug: string }) {
  const { listings, properties, agents } = useDemo();
  const listing = listings.find((l) => l.slug === slug);
  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-2xl font-bold">That home isn't listed anymore.</h1>
        <Button href="/listings" variant="secondary" className="mt-6">
          See all homes
        </Button>
      </div>
    );
  }
  const property = properties.find((p) => p.id === listing.propertyId)!;
  const selfShow = listing.showingMode === "SELF" || listing.showingMode === "BOTH";
  const agentShow = listing.showingMode === "AGENT" || listing.showingMode === "BOTH";
  const primaryAgent = agents.find((a) => a.id === listing.agentIds[0]);
  const bookable = listing.status === "ACTIVE" && listing.showingMode !== "NONE";

  return (
    <div>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-5">
        <Link href="/listings" className="text-[13px] font-semibold text-ash hover:text-ink">
          ← All homes
        </Link>
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 mt-4 grid gap-3 md:grid-cols-[2fr_1fr] md:grid-rows-2 md:h-[440px]">
        <div className="relative aspect-[16/10] md:aspect-auto md:row-span-2 rounded-lg overflow-hidden bg-paper">
          <Image src={listing.photos[0]} alt={`${property.name} ${listing.unitLabel}`} fill priority sizes="(min-width: 768px) 66vw, 100vw" className="object-cover" />
        </div>
        {listing.photos.slice(1, 3).map((src) => (
          <div key={src} className="relative hidden md:block rounded-lg overflow-hidden bg-paper">
            <Image src={src} alt="" fill sizes="33vw" className="object-cover" />
          </div>
        ))}
        {listing.photos.length < 3 && (
          <div className="hidden md:flex rounded-lg bg-ink text-white p-6 flex-col justify-end">
            <Eyebrow className="text-strike">{property.neighborhood}</Eyebrow>
            <div className="mt-2 text-lg font-bold leading-snug">{property.address}</div>
            <div className="text-white/60 text-sm">
              {property.city}, {property.state} {property.zip}
            </div>
          </div>
        )}
        {listing.photos.length < 2 && (
          <div className="hidden md:block rounded-lg bg-paper border border-line-soft p-6">
            <div className="text-[13px] font-semibold text-ink-3">Available</div>
            <div className="mt-1 text-xl font-extrabold text-ink">{fmtDateLong(listing.availableOn)}</div>
            <div className="mt-4 text-[13px] font-semibold text-ink-3">Lease</div>
            <div className="mt-1 text-xl font-extrabold text-ink">{listing.leaseTermMonths} months</div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <Eyebrow>{property.name}</Eyebrow>
          <h1 className="mt-2 text-[30px] sm:text-[38px] font-extrabold tracking-[-0.02em] leading-[1.05] text-ink">{listing.headline}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-ink-3">
            <span>{beds(listing.beds)}</span>
            <span>{baths(listing.baths)}</span>
            <span>{listing.sqft.toLocaleString()} sq ft</span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} /> {property.address}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {selfShow && (
              <Badge tone="ink">
                <KeyRound size={11} /> Self-guided tours
              </Badge>
            )}
            {agentShow && (
              <Badge tone="neutral">
                <UserRound size={11} /> Guided tours
              </Badge>
            )}
            <Badge tone="neutral">
              <PawPrint size={11} /> {listing.pets === "NO" ? "No pets" : listing.pets === "YES" ? "Pets welcome" : "Pets case by case"}
            </Badge>
            {listing.furnished && <Badge tone="neutral">Furnished option</Badge>}
          </div>

          <p className="mt-8 text-[17px] leading-relaxed text-ink-2 max-w-2xl">{listing.description}</p>

          <h2 className="mt-10 text-lg font-bold text-ink">What's included</h2>
          <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 max-w-2xl">
            {listing.amenities.map((a) => (
              <li key={a} className="flex items-center gap-2 text-[15px] text-ink-2">
                <Check size={16} className="text-leaf shrink-0" /> {a}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-lg font-bold text-ink">How touring works</h2>
          <ol className="mt-3 space-y-4 max-w-2xl">
            {[
              ["Answer five questions", "Move-in date, income, pets, smoking, and rental history. Takes about a minute."],
              ["Pick a time", selfShow ? "Guided tours with our team, or a self-guided tour any day 8am–8pm." : "Choose from our leasing team's open times."],
              ["Confirm by text", "Reply C to the confirmation text. We'll remind you the day before and an hour before."],
              selfShow ? ["Let yourself in", "Your one-time lockbox code arrives 15 minutes before your tour. Lock up when you leave."] : ["Meet at the door", `${primaryAgent?.name ?? "Your leasing agent"} will meet you at the home.`],
            ].map(([t, b], i, arr) => (
              <li key={t} className={`matchstick is-lit ${i === arr.length - 1 ? "is-last" : ""}`}>
                <div className="font-bold text-ink">{t}</div>
                <div className="text-[14px] text-ink-3">{b}</div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-lg border border-line-soft shadow-pop p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-[34px] font-extrabold tabular leading-none text-ink">{money(listing.rentPerBed ?? listing.rent)}</span>
              <span className="text-ash">{listing.rentPerBed ? "/ bed / mo" : "/ mo"}</span>
            </div>
            {listing.rentPerBed && <div className="mt-1 text-[13px] text-ash">{money(listing.rent)} per unit · individual leases</div>}
            <dl className="mt-5 grid grid-cols-2 gap-y-3 text-[14px]">
              <dt className="text-ash">Available</dt>
              <dd className="font-semibold text-ink text-right">{fmtDateLong(listing.availableOn)}</dd>
              <dt className="text-ash">Lease</dt>
              <dd className="font-semibold text-ink text-right">{listing.leaseTermMonths} months</dd>
              <dt className="text-ash">Deposit</dt>
              <dd className="font-semibold text-ink text-right">{money(listing.deposit)}</dd>
            </dl>
            {bookable ? (
              <>
                <Button href={`/listings/${listing.slug}/tour`} size="lg" className="w-full mt-6">
                  Schedule a tour
                </Button>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] text-ash">
                  <Clock size={13} /> Next opening today · no account needed
                </div>
              </>
            ) : (
              <>
                <Button href={`/listings/${listing.slug}/tour`} size="lg" variant="secondary" className="w-full mt-6">
                  Join the waitlist
                </Button>
                <div className="mt-3 text-center text-[12.5px] text-ash">{listing.status === "LEASED" ? "This home is leased. We'll text you if it opens up." : "Tours are paused for this home."}</div>
              </>
            )}
            <a href="https://matchboxrealty.com/apply" className="block mt-4 text-center text-[13px] font-semibold text-ink-3 hover:text-strike">
              Already toured? Apply now →
            </a>
          </div>

          {primaryAgent && (
            <div className="mt-4 bg-paper rounded-lg p-5 flex items-center gap-3">
              <span className="size-10 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: primaryAgent.color }}>
                {primaryAgent.initials}
              </span>
              <div className="text-[13.5px]">
                <div className="font-bold text-ink">{primaryAgent.name}</div>
                <div className="text-ink-3">{primaryAgent.title} · {primaryAgent.phone}</div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
