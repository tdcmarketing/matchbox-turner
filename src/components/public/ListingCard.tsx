"use client";

import Image from "next/image";
import { asset } from "@/lib/asset";
import Link from "next/link";
import type { Listing, Property } from "@/lib/data/types";
import { beds, baths, fmtDateShort, money } from "@/lib/format";
import { Badge } from "@/components/ui";

export function ListingCard({ listing, property, now }: { listing: Listing; property: Property; now: Date }) {
  const availableSoon = new Date(listing.availableOn).getTime() - now.getTime() < 30 * 86400000;
  const selfShow = listing.showingMode === "SELF" || listing.showingMode === "BOTH";
  return (
    <Link href={`/listing/?slug=${listing.slug}`} className="group block bg-white rounded-lg overflow-hidden border border-line-soft shadow-card hover:shadow-pop transition-shadow">
      <div className="relative aspect-[4/3] bg-paper">
        <Image src={asset(listing.photos[0])} alt={`${property.name} ${listing.unitLabel}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-[1.02] transition-transform duration-500" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {selfShow && <Badge tone="ink">Self-guided tours</Badge>}
          {availableSoon && listing.status === "ACTIVE" && <Badge tone="red">Available {fmtDateShort(listing.availableOn)}</Badge>}
          {listing.status === "LEASED" && <Badge tone="neutral">Leased</Badge>}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-[13px] font-bold uppercase tracking-wider text-strike">{property.name}</div>
          <div className="text-[13px] text-ash">{property.neighborhood}</div>
        </div>
        <h3 className="mt-1 font-bold text-ink text-[17px] leading-snug">{listing.headline}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[22px] font-extrabold tabular text-ink">{money(listing.rentPerBed ?? listing.rent)}</span>
          <span className="text-[13px] text-ash">{listing.rentPerBed ? "/ bed / mo" : "/ mo"}</span>
        </div>
        <div className="mt-2 text-[13px] text-ink-3">
          {beds(listing.beds)} · {baths(listing.baths)} · {listing.sqft.toLocaleString()} sq ft · {listing.unitLabel}
        </div>
      </div>
    </Link>
  );
}
