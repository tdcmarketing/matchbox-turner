import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-2.5rem)] flex flex-col bg-paper-2">
      <header className="bg-white border-b border-line-soft">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo href="/listings" />
          <nav className="flex items-center gap-1 sm:gap-6 text-[14px] font-semibold text-ink-2">
            <Link href="/listings" className="px-2 py-1 hover:text-strike">
              Find a home
            </Link>
            <a href="https://matchboxrealty.com/residential/resources/" className="hidden sm:block px-2 py-1 hover:text-strike">
              Resources
            </a>
            <a href="https://matchboxrealty.com/matchbox-rewards/" className="hidden md:block px-2 py-1 hover:text-strike">
              Matchbox Rewards
            </a>
            <a
              href="https://matchboxrealty.com/apply"
              className="ml-2 inline-flex h-9 items-center rounded-md bg-strike px-4 text-white hover:bg-strike-deep"
            >
              Apply now
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line-soft bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 grid gap-6 sm:grid-cols-3 text-[13px] text-ink-3">
          <div>
            <Logo href="/listings" />
            <p className="mt-3">202 North Liberty Street, Suite 101<br />Harrisonburg, VA 22802</p>
          </div>
          <div>
            <div className="font-bold text-ink mb-2">Leasing office</div>
            <p>Mon–Fri 9am–5pm<br />(540) 434-6673<br />leasing@matchboxrealty.com</p>
          </div>
          <div>
            <div className="font-bold text-ink mb-2">Tours</div>
            <p>Book online any time. Self-guided tours available daily 8am–8pm at select homes.</p>
            <Link href="/" className="inline-block mt-3 text-ash hover:text-ink">
              Demo home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
