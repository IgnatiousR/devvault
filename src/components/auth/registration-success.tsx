"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RegistrationSuccessProps {
  email: string;
  onResend: () => void;
  resending: boolean;
  className?: string;
}

export function RegistrationSuccess({
  email,
  onResend,
  resending,
  className,
}: RegistrationSuccessProps) {
  return (
    <div className={cn("w-full max-w-md space-y-6 text-center", className)}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <svg
          className="h-8 w-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold">Check your email</h1>
      <p className="text-muted-foreground">
        We&apos;ve sent a verification link to{" "}
        <span className="font-medium text-foreground">{email}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        Click the link in the email to verify your account. The link will expire in 24 hours.
      </p>
      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={onResend}
          disabled={resending}
          className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
        >
          {resending ? "Sending..." : "Resend verification email"}
        </Button>
        <Link
          href="/login"
          className="block w-full rounded-md bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
