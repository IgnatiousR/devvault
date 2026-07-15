"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checks, X } from "@phosphor-icons/react";

const freeFeatures = [
  { text: "50 items", included: true },
  { text: "3 collections", included: true },
  { text: "All item types", included: true },
  { text: "Instant search", included: true },
  { text: "AI features", included: false },
  { text: "Cloud sync", included: false },
];

const proFeatures = [
  { text: "Unlimited items", included: true, bold: true },
  { text: "Unlimited collections", included: true, bold: true },
  { text: "All item types", included: true },
  { text: "Instant search", included: true },
  {
    text: "AI features — auto-tags, descriptions, search",
    included: true,
    bold: true,
    highlight: true,
  },
  { text: "Cloud sync across devices", included: true },
];

export function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-wider text-red-400 font-semibold mb-3">
            Pricing
          </div>
          <h2 className="font-bold text-4xl lg:text-5xl tracking-tight mb-4">
            Start free.{" "}
            <span className="gradient-text">
              Upgrade when you&apos;re hooked.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            No surprises. Cancel anytime. Yearly billing saves you 25%.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-10">
          <span
            className={`text-sm font-medium transition-colors ${
              !yearly ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setYearly(!yearly)}
            className={`relative w-14 h-7.5 rounded-full transition-colors ${
              yearly
                ? "bg-linear-to-r from-red-500 to-red-600"
                : "bg-white/10"
            }`}
            role="switch"
            aria-checked={yearly}
          >
            <div
              className={`absolute top-0.75 left-0.75 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                yearly ? "`translate-x-6.5" : ""
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium transition-colors flex items-center gap-2 ${
              yearly ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Yearly
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
              SAVE 25%
            </span>
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-white/2 p-7 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-xl">Free</h3>
              <span className="text-xs text-muted-foreground font-mono">
                For trying out
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Everything you need to feel the magic.
            </p>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-bold text-5xl tracking-tight">$0</span>
              <span className="text-muted-foreground text-sm">/forever</span>
            </div>
            <div className="text-xs text-muted-foreground mb-7">
              No credit card required
            </div>

            <Link href="/register" className="block mb-7">
              <Button
                variant="outline"
                className="w-full py-3 border-white/15 hover:border-white/30 text-white font-semibold rounded-xl"
              >
                Get Started
              </Button>
            </Link>

            <ul className="space-y-3 text-sm">
              {freeFeatures.map((f) => (
                <li
                  key={f.text}
                  className={`flex items-center gap-3 ${
                    f.included ? "text-gray-300" : "text-muted-foreground"
                  }`}
                >
                  {f.included ? (
                    <Checks className="size-4 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="size-4 text-gray-600 shrink-0" />
                  )}
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-2xl border border-red-500/40 bg-gradient-to-b from-red-500/[0.08] to-transparent p-7 flex flex-col shadow-[0_30px_60px_-15px_rgba(239,68,68,0.3)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold shadow-lg">
              Most Popular
            </div>

            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-xl">Pro</h3>
              <span className="text-xs text-red-300 font-mono">
                For power users
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Unlock the full power of DevVault.
            </p>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-bold text-5xl tracking-tight">
                {yearly ? "$72" : "$8"}
              </span>
              <span className="text-muted-foreground text-sm">
                {yearly ? "/year" : "/month"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mb-7">
              {yearly
                ? "Billed yearly · $6/mo effective · Save 25%"
                : "Billed monthly · Cancel anytime"}
            </div>

            <Link href="/register" className="block mb-7">
              <Button className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold rounded-xl shadow-lg">
                Get Pro
              </Button>
            </Link>

            <ul className="space-y-3 text-sm">
              {proFeatures.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-gray-200">
                  <Checks className="size-4 text-emerald-400 shrink-0" />
                  <span className={f.bold ? "font-semibold" : ""}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
