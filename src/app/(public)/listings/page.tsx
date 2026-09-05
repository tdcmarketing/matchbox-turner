"use client";

import { useMemo, useState } from "react";
import { useDemo } from "@/lib/store";
import { Hydrated } from "@/components/Hydrated";
import { ListingCard } from "@/components/public/ListingCard";
import { Select } from "@/components/ui";

const bedOptions = ["Any beds", "Studio", "1", "2", "3", "4+"];
const typeOptions = ["All homes", "Student housing", "Non-student"];

export default function ListingsPage() {
  return (
    <Hydrated>
      <Listings />
    </Hydrated>
  );
}

function Listings() {
  const { listings, properties, now } = useDemo();
  const today = now();
  const [bedsF, setBedsF] = useState("Any beds");
  const [typeF, setTypeF] = useState("All homes");
  const [hoodF, setHoodF] = useState("Anywhere in Harrisonburg");
  const [selfOnly, setSelfOnly] = useState(false);

  const hoods = useMemo(() => ["Anywhere in Harrisonburg", ...Array.from(new Set(properties.map((p) => p.neighborhood)))], [properties]);

  const visible = listings
    .filter((l) => l.status === "ACTIVE" || l.status === "LEASED")
    .filter((l) => {
      const p = properties.find((x) => x.id === l.propertyId)!;
      if (typeF === "Student housing" && p.type !== "STUDENT") return false;
      if (typeF === "Non-student" && p.type === "STUDENT") return false;
      if (hoodF !== "Anywhere in Harrisonburg" && p.neighborhood !== hoodF) return false;
      if (bedsF === "Studio" && l.beds !== 0) return false;
      if (bedsF === "4+" && l.beds < 4) return false;
      if (["1", "2", "3"].includes(bedsF) && l.beds !== Number(bedsF)) return false;
      if (selfOnly && !(l.showingMode === "SELF" || l.showingMode === "BOTH")) return false;
      return true;
    })
    .sort((a, b) => (a.status === b.status ? a.availableOn.localeCompare(b.availableOn) : a.status === "ACTIVE" ? -1 : 1));

  return (
    <div>
      <section className="bg-white border-b border-line-soft">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-10 pb-8">
          <h1 className="text-[34px] sm:text-[44px] font-extrabold tracking-[-0.02em] leading-none text-ink">Find a home</h1>
          <p className="mt-3 text-ink-3 max-w-xl">
            Every available Matchbox home in Harrisonburg. Pick one, answer five quick questions, and choose a tour time that works for you.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <Select value={typeF} onChange={(e) => setTypeF(e.target.value)} aria-label="Home type">
              {typeOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
            <Select value={bedsF} onChange={(e) => setBedsF(e.target.value)} aria-label="Bedrooms">
              {bedOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
            <Select value={hoodF} onChange={(e) => setHoodF(e.target.value)} aria-label="Neighborhood">
              {hoods.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
            <label className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-line bg-white text-sm font-medium text-ink-2 cursor-pointer select-none">
              <input type="checkbox" checked={selfOnly} onChange={(e) => setSelfOnly(e.target.checked)} className="accent-[var(--strike)]" />
              Self-guided tours
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-8">
        <div className="flex items-baseline justify-between mb-4">
          <div className="text-sm text-ash">
            <span className="font-bold text-ink tabular">{visible.length}</span> home{visible.length === 1 ? "" : "s"}
          </div>
          <div className="text-[13px] text-ash">Sorted by move-in date</div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((l) => (
            <ListingCard key={l.id} listing={l} property={properties.find((p) => p.id === l.propertyId)!} now={today} />
          ))}
        </div>
      </section>
    </div>
  );
}
