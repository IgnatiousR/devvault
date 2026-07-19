"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "@phosphor-icons/react";

interface UpgradePromptProps {
  feature: string;
  description?: string;
}

export function UpgradePrompt({ feature, description }: UpgradePromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const { subscription } = await import("@/lib/auth-client");
      await subscription.upgrade({
        plan: "pro",
        successUrl: `${window.location.origin}/settings/billing/success`,
        cancelUrl: `${window.location.origin}/settings/billing/cancel`,
        annual: true,
      });
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
      <h3 className="font-medium mb-1">Upgrade to Pro</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {description || `${feature} is a Pro feature`}
      </p>
      <Button
        onClick={handleUpgrade}
        disabled={isLoading}
        className="gap-2"
      >
        Upgrade Now
        <ArrowUpRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
