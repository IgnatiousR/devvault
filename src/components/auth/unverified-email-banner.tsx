"use client";

import { Button } from "@/components/ui/button";

interface UnverifiedEmailBannerProps {
  email: string;
  onResend: () => void;
  resending: boolean;
}

export function UnverifiedEmailBanner({
  email,
  onResend,
  resending,
}: UnverifiedEmailBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-md bg-yellow-500/10 border border-yellow-500/20 p-4 text-sm"
    >
      <p className="font-medium text-yellow-600 mb-2">
        Please verify your email address
      </p>
      <p className="text-muted-foreground mb-3">
        We sent a verification link to{" "}
        <span className="font-medium text-foreground">{email}</span>.
        Please check your inbox and click the link to verify your account.
      </p>
      <Button
        variant="ghost"
        onClick={onResend}
        disabled={resending}
        className="text-sm font-medium text-yellow-600 hover:underline disabled:opacity-50"
      >
        {resending ? "Sending..." : "Resend verification email"}
      </Button>
    </div>
  );
}
