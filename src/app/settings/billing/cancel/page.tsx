"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto p-6">
        <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Checkout canceled</h1>
        <p className="text-muted-foreground mb-6">
          No worries! You can upgrade anytime from your settings.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => router.push("/settings")}>
            Back to Settings
          </Button>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
