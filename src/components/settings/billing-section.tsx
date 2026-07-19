"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface UsageStatus {
  items: { current: number; limit: number; percentage: number };
  collections: { current: number; limit: number; percentage: number };
}

interface BillingStatus {
  isPro: boolean;
  usage: UsageStatus | null;
}

export function BillingSection() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);

  const user = session?.user;
  const isPro = billingStatus?.isPro ?? false;

  useEffect(() => {
    if (user) {
      fetch("/api/billing/status")
        .then((res) => res.json())
        .then((data) => {
          setBillingStatus({
            isPro: data.isPro ?? false,
            usage: data.usage ?? null,
          });
        })
        .catch(console.error);
    }
  }, [user]);

  const handleUpgrade = async (annual: boolean) => {
    setIsLoading(true);
    try {
      const { subscription } = await import("@/lib/auth-client");
      await subscription.upgrade({
        plan: "pro",
        successUrl: `${window.location.origin}/settings/billing/success`,
        cancelUrl: `${window.location.origin}/settings/billing/cancel`,
        annual,
      });
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const { subscription } = await import("@/lib/auth-client");
      const portalResult = await subscription.billingPortal({
        returnUrl: `${window.location.origin}/settings`,
      });
      if (portalResult.data?.url) {
        window.location.href = portalResult.data.url;
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return <Spinner />;
  }

  return (
    <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Billing & Subscription
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Current Plan</p>
            <p className="text-sm text-muted-foreground">
              {isPro ? "DevVault Pro" : "Free Tier"}
            </p>
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              isPro
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {isPro ? "Pro" : "Free"}
          </span>
        </div>

        {isPro ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>You have access to all Pro features:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Unlimited items and collections</li>
                <li>File uploads (images and documents)</li>
                <li>AI-powered features</li>
                <li>Custom item types</li>
                <li>Export functionality</li>
              </ul>
            </div>
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={isLoading}
            >
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                <h3 className="font-medium">Monthly</h3>
                <p className="text-sm text-muted-foreground">$8/month</p>
                <Button
                  className="w-full mt-4"
                  onClick={() => handleUpgrade(false)}
                  disabled={isLoading}
                >
                  Upgrade Monthly
                </Button>
              </div>

              <div className="border border-primary rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                <h3 className="font-medium">Annual</h3>
                <p className="text-sm text-muted-foreground">$72/year (Save 25%)</p>
                <Button
                  className="w-full mt-4"
                  onClick={() => handleUpgrade(true)}
                  disabled={isLoading}
                >
                  Upgrade Annual
                </Button>
              </div>
            </div>

            {billingStatus?.usage && (
              <div className="space-y-2">
                <p className="font-medium text-sm">Current Usage</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Items</span>
                    <span>{billingStatus.usage.items.current} / {billingStatus.usage.items.limit}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(billingStatus.usage.items.percentage, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Collections</span>
                    <span>{billingStatus.usage.collections.current} / {billingStatus.usage.collections.limit}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(billingStatus.usage.collections.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Free Tier Limits:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>50 items</li>
                <li>3 collections</li>
                <li>No file uploads</li>
                <li>No AI features</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
