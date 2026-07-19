"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
  { text: "Unlimited items", bold: true },
  { text: "Unlimited collections", bold: true },
  { text: "All item types" },
  { text: "Instant search" },
  { text: "AI features — auto-tags, descriptions, search", bold: true, highlight: true },
  { text: "Cloud sync across devices" },
];

export default function UpgradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [yearly, setYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [billingLoaded, setBillingLoaded] = useState(false);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    fetch("/api/billing/status")
      .then((res) => res.json())
      .then((data) => {
        setIsPro(data.isPro ?? false);
        setBillingLoaded(true);
      })
      .catch(() => {
        setIsPro(false);
        setBillingLoaded(true);
      });
  }, []);

  const handleUpgrade = async (annual: boolean) => {
    setIsLoading(true);
    try {
      const { subscription } = await import("@/lib/auth-client");
      await subscription.upgrade({
        plan: "pro",
        successUrl: `${window.location.origin}/dashboard/upgrade?success=1`,
        cancelUrl: `${window.location.origin}/dashboard/upgrade?canceled=1`,
        annual,
      });
    } catch (error) {
      console.error("Upgrade failed:", error);
      setIsLoading(false);
    }
  };

  if (!billingLoaded) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (success) {
    return (
      <div className="relative py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-3">
            Welcome to Pro
          </div>
          <h2 className="font-bold text-4xl lg:text-5xl tracking-tight mb-4">
            You&apos;re all{" "}
            <span className="gradient-text">upgraded!</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Enjoy unlimited items, collections, AI features, and cloud sync.
          </p>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold rounded-xl px-8 py-3">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (canceled) {
    return (
      <div className="relative py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            Checkout canceled
          </div>
          <h2 className="font-bold text-4xl lg:text-5xl tracking-tight mb-4">
            No worries
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Your upgrade was not completed. You can try again anytime.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-xl px-6 py-3">
                Go to Dashboard
              </Button>
            </Link>
            <Button
              onClick={() => router.push("/dashboard/upgrade")}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold rounded-xl px-6 py-3"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isPro) {
    return (
      <div className="relative py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs uppercase tracking-wider text-red-400 font-semibold mb-3">
            Pro
          </div>
          <h2 className="font-bold text-4xl lg:text-5xl tracking-tight mb-4">
            You&apos;re already a{" "}
            <span className="gradient-text">Pro member!</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            You have access to all Pro features. Manage your subscription anytime.
          </p>
        </div>

        <div className="relative rounded-2xl border border-red-500/40 bg-gradient-to-b from-red-500/[0.08] to-transparent p-7 flex flex-col shadow-[0_30px_60px_-15px_rgba(239,68,68,0.3)] max-w-lg mx-auto">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold shadow-lg">
            Active
          </div>

          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-xl">Pro</h3>
            <span className="text-xs text-red-300 font-mono">Your plan</span>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            You have the full power of DevVault.
          </p>

          <ul className="space-y-3 text-sm mb-7">
            {proFeatures.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-gray-200">
                <Checks className="size-4 text-emerald-400 shrink-0" />
                <span className={f.bold ? "font-semibold" : ""}>{f.text}</span>
              </li>
            ))}
          </ul>

          <Link href="/settings/billing">
            <Button variant="outline" className="w-full py-3 border-white/15 hover:border-white/30 text-white font-semibold rounded-xl">
              Manage Subscription
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-10">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="text-xs uppercase tracking-wider text-red-400 font-semibold mb-3">
          Upgrade
        </div>
        <h2 className="font-bold text-4xl lg:text-5xl tracking-tight mb-4">
          Unlock the{" "}
          <span className="gradient-text">full power</span> of DevVault.
        </h2>
        <p className="text-muted-foreground text-lg">
          No surprises. Cancel anytime. Yearly billing saves you 25%.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
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
              yearly ? "translate-x-6.5" : ""
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

          <div className="mb-7">
            <Button
              variant="outline"
              disabled
              className="w-full py-3 border-white/15 text-white font-semibold rounded-xl opacity-50"
            >
              Current Plan
            </Button>
          </div>

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

          <Button
            onClick={() => handleUpgrade(yearly)}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold rounded-xl shadow-lg"
          >
            {isLoading ? "Redirecting..." : "Upgrade to Pro"}
          </Button>

          <ul className="space-y-3 text-sm mt-7">
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
  );
}
