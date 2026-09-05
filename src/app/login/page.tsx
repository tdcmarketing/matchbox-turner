"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo, Matchstick } from "@/components/Logo";
import { Button, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("kelsey@matchboxrealty.com");
  const [sent, setSent] = useState(false);
  return (
    <main className="min-h-[calc(100vh-2.5rem)] grid lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-between bg-ink text-white p-10">
        <Logo invert product />
        <div>
          <Matchstick size={40} className="text-white" />
          <h1 className="mt-6 text-[40px] leading-[1.05] font-extrabold tracking-tight max-w-md">Every tour, confirmed while you sleep.</h1>
          <p className="mt-4 text-white/60 max-w-md">Leads qualify themselves, pick a time, and get reminded. You get a calendar that's already full.</p>
        </div>
        <div className="text-[12px] text-white/40">Matchbox Realty · Leasing desk</div>
      </section>
      <section className="flex items-center justify-center p-8 bg-paper-2">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo product />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">Sign in</h2>
          <p className="mt-1 text-ink-3 text-[14px]">We'll email you a one-time link. No password to remember.</p>
          {!sent ? (
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <Field label="Work email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </Field>
              <Button type="submit" size="lg" className="w-full">
                Email me a sign-in link
              </Button>
              <Button type="button" variant="secondary" size="lg" className="w-full" onClick={() => router.push("/app")}>
                Continue with Google
              </Button>
            </form>
          ) : (
            <div className="mt-6 rounded-lg bg-white border border-line-soft p-5 rise">
              <div className="font-bold text-ink">Check your inbox</div>
              <p className="mt-1 text-[14px] text-ink-3">We sent a link to {email}. It expires in 15 minutes.</p>
              <Button className="mt-4 w-full" onClick={() => router.push("/app")}>
                Open the link (demo)
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
