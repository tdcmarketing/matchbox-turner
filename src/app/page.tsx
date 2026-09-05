import Link from "next/link";
import { Logo, Matchstick } from "@/components/Logo";
import { Eyebrow } from "@/components/ui";

const doors = [
  {
    href: "/listings",
    eyebrow: "What renters see",
    title: "Find a home",
    body: "Browse Matchbox listings, answer a few questions, and book a tour in under two minutes. Self-guided tours unlock a code at tour time.",
    cta: "Open the renter site",
  },
  {
    href: "/app",
    eyebrow: "What the leasing team sees",
    title: "Leasing desk",
    body: "Every lead, tour, lockbox, and message in one place. Confirmations, reminders, and follow-ups go out on their own.",
    cta: "Open the staff app",
  },
];

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-2.5rem)] bg-ink text-white flex flex-col">
      <header className="px-6 sm:px-10 py-6 flex items-center justify-between">
        <Logo invert product />
        <nav className="flex items-center gap-5 text-[13px] font-semibold text-white/60">
          <Link href="/rm" className="hover:text-white">
            Rent Manager view (simulated) →
          </Link>
          <Link href="/app/settings/rent-manager" className="hover:text-white">
            Notes →
          </Link>
        </nav>
      </header>

      <section className="flex-1 flex flex-col justify-center px-6 sm:px-10 pb-16">
        <div className="max-w-5xl">
          <div className="flex items-center gap-3 text-white/60 mb-6">
            <Matchstick size={22} className="text-white" />
            <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Matchbox Turner · demo</span>
          </div>
          <h1 className="text-[44px] sm:text-[68px] leading-[0.98] font-extrabold tracking-[-0.02em] max-w-4xl">
            From inquiry to keys,
            <br />
            <span className="text-strike">without the phone tag.</span>
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-2xl leading-relaxed">
            Leasing automation built for Matchbox Realty. Pre-qualified leads book their own tours, confirm by text, and let
            themselves in with a one-time code. Your team just watches the calendar fill.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 max-w-5xl">
          {doors.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className="group relative rounded-lg bg-white/[0.04] border border-white/10 p-7 hover:bg-white/[0.07] hover:border-white/25 transition-colors"
            >
              <Eyebrow className="text-strike">{d.eyebrow}</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold">{d.title}</h2>
              <p className="mt-2 text-white/65 leading-relaxed">{d.body}</p>
              <div className="mt-6 text-sm font-semibold text-white group-hover:translate-x-0.5 transition-transform">{d.cta} →</div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="px-6 sm:px-10 py-5 border-t border-white/10 text-[12px] text-white/40 flex flex-wrap gap-x-6 gap-y-1">
        <span>Demo build. Data is sample data and resets from the staff app.</span>
        <span>202 North Liberty Street, Suite 101, Harrisonburg, VA 22802</span>
      </footer>
    </main>
  );
}
