"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/* ---------- Button ---------- */
type Variant = "primary" | "secondary" | "ghost" | "danger" | "ink";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-strike text-white hover:bg-strike-deep shadow-[inset_0_-1px_0_rgba(0,0,0,0.15)]",
  ink: "bg-ink text-white hover:bg-ink-2",
  secondary: "bg-white text-ink border border-line hover:border-ink-3 hover:bg-paper-2",
  ghost: "bg-transparent text-ink-2 hover:bg-paper",
  danger: "bg-white text-strike border border-strike/40 hover:bg-strike-soft",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
}

export function Button({ variant = "primary", size = "md", className, href, children, ...rest }: ButtonProps) {
  const cls = cn(
    "inline-flex items-center justify-center rounded-md font-semibold whitespace-nowrap transition-colors disabled:opacity-50 disabled:pointer-events-none select-none",
    variants[variant],
    sizes[size],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/* ---------- Card ---------- */
export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white rounded-lg border border-line-soft shadow-card", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action, subtitle, className }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-4 pb-3", className)}>
      <div>
        <h3 className="text-[15px] font-bold text-ink">{title}</h3>
        {subtitle && <p className="text-[13px] text-ash mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Badge ---------- */
type Tone = "neutral" | "red" | "green" | "amber" | "blue" | "ink";
const tones: Record<Tone, string> = {
  neutral: "bg-paper text-ink-3",
  red: "bg-strike-soft text-strike-deep",
  green: "bg-leaf-soft text-[#3f6f18]",
  amber: "bg-amber-soft text-[#8a5a0c]",
  blue: "bg-sky-soft text-[#1f4f85]",
  ink: "bg-ink text-white",
};
export function Badge({ tone = "neutral", className, children, dot }: { tone?: Tone; className?: string; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-semibold tracking-wide uppercase", tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ---------- Inputs ---------- */
const fieldBase =
  "w-full rounded-md border border-line bg-white px-3 text-sm text-ink placeholder:text-smoke focus:border-ink focus:outline-none focus:ring-2 focus:ring-strike/20 disabled:bg-paper-2";

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, "h-10", className)} {...rest} />;
}
export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "py-2 min-h-24", className)} {...rest} />;
}
export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldBase, "h-10 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23575555%22 stroke-width=%222.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-no-repeat bg-[right_10px_center] pr-8", className)} {...rest}>
      {children}
    </select>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-[13px] font-semibold text-ink-2 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-ash mt-1.5">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 group"
    >
      <span className={cn("relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-leaf" : "bg-line")}>
        <span className="absolute top-0.5 size-4 rounded-full bg-white shadow transition-[left]" style={{ left: checked ? 18 : 2 }} />
      </span>
      {label && <span className="text-sm text-ink-2">{label}</span>}
    </button>
  );
}

/* ---------- Avatar ---------- */
export function Avatar({ initials, color, size = 32, className }: { initials: string; color?: string; size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-full font-bold text-white shrink-0", className)}
      style={{ width: size, height: size, fontSize: size * 0.36, background: color ?? "var(--ink-3)" }}
    >
      {initials}
    </span>
  );
}

/* ---------- Stat ---------- */
export function Stat({ label, value, delta, tone = "neutral" }: { label: string; value: React.ReactNode; delta?: string; tone?: "neutral" | "good" | "bad" }) {
  return (
    <div className="bg-white rounded-lg border border-line-soft shadow-card px-5 py-4">
      <div className="text-[12px] font-semibold uppercase tracking-wider text-ash">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-[28px] leading-none font-extrabold tabular text-ink">{value}</div>
        {delta && <div className={cn("text-xs font-semibold", tone === "good" ? "text-leaf" : tone === "bad" ? "text-strike" : "text-ash")}>{delta}</div>}
      </div>
    </div>
  );
}

/* ---------- Empty ---------- */
export function Empty({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="mx-auto mb-3 size-10 rounded-full bg-paper flex items-center justify-center">
        <span className="block h-4 w-[3px] rounded bg-line relative">
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-2.5 rounded-full bg-strike" />
        </span>
      </div>
      <div className="font-bold text-ink">{title}</div>
      {body && <div className="text-sm text-ash mt-1 max-w-sm mx-auto">{body}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- Section label ---------- */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("text-[11.5px] font-bold uppercase tracking-[0.14em] text-strike", className)}>{children}</div>;
}

/* ---------- Table ---------- */
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}
export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("text-left text-[11.5px] font-bold uppercase tracking-wider text-ash px-4 py-2.5 border-b border-line-soft whitespace-nowrap", className)}>{children}</th>;
}
export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 border-b border-line-soft align-middle", className)}>{children}</td>;
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, width = "max-w-lg" }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: string }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className={cn("relative w-full bg-white rounded-lg shadow-pop rise", width)}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line-soft">
          <h3 className="font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="text-ash hover:text-ink text-xl leading-none px-1" aria-label="Close">
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Toast ---------- */
export function useToast() {
  const [toast, setToast] = React.useState<string | null>(null);
  const show = React.useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);
  const node = toast ? (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rise">
      <div className="bg-ink text-white text-sm font-medium px-4 py-2.5 rounded-md shadow-pop flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-strike" />
        {toast}
      </div>
    </div>
  ) : null;
  return { show, node };
}
