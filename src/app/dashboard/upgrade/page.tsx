"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FreeFeatureList, ProFeatureList, PricingToggle } from "@/components/ui/pricing-shared";

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

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner />
    </div>
  );
}

function SuccessState() {
  return (
    <div className="relative py-16">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-3">
          Welcome to Pro
        </div>
        <h2 className="font-bold text-4xl lg:text-5xl tracking-tight mb-4">
          You&apos;re all <span className="gradient-text">upgraded!</span>
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

function CanceledState() {
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
          <Link href="/dashboard/upgrade">
            <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold rounded-xl px-6 py-3">
              Try Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function AlreadyProState() {
  return (
    <div className="relative py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="text-xs uppercase tracking-wider text-red-400 font-semibold mb-3">Pro</div>
        <h2 className="font-bold text-4xl lg:text-5xl tracking-tight mb-4">
          You&apos;re already a <span className="gradient-text">Pro member!</span>
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
        <p className="text-sm text-muted-foreground mb-5">You have the full power of DevVault.</p>

        <ProFeatureList features={proFeatures} />

        <div className="mt-7">
          <Link href="/settings/billing">
            <Button variant="outline" className="w-full py-3 border-white/15 hover:border-white/30 text-white font-semibold rounded-xl">
              Manage Subscription
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function PricingPlans({ yearly, onToggle, isLoading, onUpgrade }: { yearly: boolean; onToggle: () => void; isLoading: boolean; onUpgrade: (annual: boolean) => void }) {
  return (
    <div className="relative py-10">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="text-xs uppercase tracking-wider text-red-400 font-semibold mb-3">Upgrade</div>
        <h2 className="font-bold text-4xl lg:text-5xl tracking-tight mb-4">
          Unlock the <span className="gradient-text">full power</span> of DevVault.
        </h2>
        <p className="text-muted-foreground text-lg">
          No surprises. Cancel anytime. Yearly billing saves you 25%.
        </p>
      </div>

      <PricingToggle yearly={yearly} onChange={() => onToggle()} />

      <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-white/2 p-7 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-xl">Free</h3>
            <span className="text-xs text-muted-foreground font-mono">For trying out</span>
          </div>
          <p className="text-sm text-muted-foreground mb-5">Everything you need to feel the magic.</p>

          <div className="flex items-baseline gap-1 mb-1">
            <span className="font-bold text-5xl tracking-tight">$0</span>
            <span className="text-muted-foreground text-sm">/forever</span>
          </div>
          <div className="text-xs text-muted-foreground mb-7">No credit card required</div>

          <Button variant="outline" disabled className="w-full py-3 border-white/15 text-white font-semibold rounded-xl opacity-50 mb-7">
            Current Plan
          </Button>

          <FreeFeatureList features={freeFeatures} />
        </div>

          <ProPricingCard yearly={yearly} isLoading={isLoading} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
}

function ProPricingCard({ yearly, isLoading, onUpgrade }: { yearly: boolean; isLoading: boolean; onUpgrade: (annual: boolean) => void }) {
  return (
    <div className="relative rounded-2xl border border-red-500/40 bg-gradient-to-b from-red-500/[0.08] to-transparent p-7 flex flex-col shadow-[0_30px_60px_-15px_rgba(239,68,68,0.3)]">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold shadow-lg">
        Most Popular
      </div>

      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-xl">Pro</h3>
        <span className="text-xs text-red-300 font-mono">For power users</span>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Unlock the full power of DevVault.</p>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="font-bold text-5xl tracking-tight">{yearly ? "$72" : "$8"}</span>
        <span className="text-muted-foreground text-sm">{yearly ? "/year" : "/month"}</span>
      </div>
      <div className="text-xs text-muted-foreground mb-7">
        {yearly ? "Billed yearly · $6/mo effective · Save 25%" : "Billed monthly · Cancel anytime"}
      </div>

      <Button
        onClick={() => onUpgrade(yearly)}
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold rounded-xl shadow-lg"
      >
        {isLoading ? "Redirecting..." : "Upgrade to Pro"}
      </Button>

      <ProFeatureList features={proFeatures} />
    </div>
  );
}

export default function UpgradePage() {
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

  if (!billingLoaded) return <LoadingState />;
  if (success) return <SuccessState />;
  if (canceled) return <CanceledState />;
  if (isPro) return <AlreadyProState />;

  return <PricingPlans yearly={yearly} onToggle={() => setYearly(!yearly)} isLoading={isLoading} onUpgrade={handleUpgrade} />;
}
