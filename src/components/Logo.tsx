import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className, href = "/", invert = false, product = false }: { className?: string; href?: string; invert?: boolean; product?: boolean }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)} aria-label="Matchbox Realty">
      <Image src="/brand/matchbox-logo.svg" alt="Matchbox Realty" width={134} height={26} priority className={cn(invert && "invert brightness-0")} style={invert ? { filter: "brightness(0) invert(1)" } : undefined} />
      {product && (
        <span className="hidden sm:inline-flex items-center gap-2 pl-3 border-l border-line text-[13px] font-semibold tracking-wide text-ink-3">
          Turner
        </span>
      )}
    </Link>
  );
}

/** Small matchstick glyph used as a product mark. */
export function Matchstick({ size = 18, lit = true, className }: { size?: number; lit?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="14" y="10" width="4" height="18" rx="1" fill="currentColor" opacity="0.55" />
      <circle cx="16" cy="9" r="4.5" fill={lit ? "var(--strike)" : "currentColor"} />
    </svg>
  );
}
