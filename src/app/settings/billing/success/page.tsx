"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { CheckCircle } from "@phosphor-icons/react";

export default function BillingSuccessPage() {
  const router = useRouter();
  const { refetch } = useSession();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const refreshSession = async () => {
      try {
        await refetch();
        setStatus("success");
        setTimeout(() => {
          router.push("/settings?upgraded=true");
        }, 2000);
      } catch (error) {
        console.error("Session refresh failed:", error);
        setStatus("error");
      }
    };

    refreshSession();
  }, [refetch, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto p-6">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Processing your upgrade...</h1>
            <p className="text-muted-foreground">
              Please wait while we activate your Pro subscription.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Welcome to DevVault Pro!</h1>
            <p className="text-muted-foreground">
              Your subscription is now active. Redirecting to settings...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              We couldn&apos;t verify your subscription. Please contact support.
            </p>
            <button
              onClick={() => router.push("/settings")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Go to Settings
            </button>
          </>
        )}
      </div>
    </div>
  );
}
