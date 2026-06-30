"use client";

import { signIn, sendVerificationEmail } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { GitHubButton } from "./github-button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PasswordInput } from "./password-input";
import { EmailInput } from "./email-input";
import { validateSignInForm, type ValidationErrors } from "@/lib/validation";

interface SignInFormProps {
  callbackURL?: string;
  className?: string;
}

export function SignInForm({ callbackURL: initialCallbackURL, className }: SignInFormProps) {
  const searchParams = useSearchParams();
  const callbackURL = initialCallbackURL || searchParams.get("callbackUrl") || "/dashboard";
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>("");
  const [resending, setResending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Pick<ValidationErrors, "email" | "password">>({});

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const errors = validateSignInForm(email, password);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    const { error: signInError } = await signIn.email({
      email,
      password,
      callbackURL,
    });

    if (signInError) {
      if (signInError.status === 403) {
        setUnverifiedEmail(email);
        setError("");
      } else {
        setError(signInError.message || "Invalid email or password");
      }
      setLoading(false);
    } else {
      toast.success("Welcome back!", {
        description: "You have successfully signed in",
      });
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    const { error } = await sendVerificationEmail({
      email: unverifiedEmail,
      callbackURL: "/dashboard",
    });
    setResending(false);

    if (error) {
      toast.error("Failed to resend verification email", {
        description: error.message || "Please try again later",
      });
    } else {
      toast.success("Verification email sent", {
        description: `We've sent a new verification link to ${unverifiedEmail}`,
      });
    }
  };

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Sign in to DevVault</h1>
        <p className="text-muted-foreground">
          Access your developer toolkit
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500"
        >
          {error}
        </div>
      )}

      {unverifiedEmail && (
        <div
          role="alert"
          className="rounded-md bg-yellow-500/10 border border-yellow-500/20 p-4 text-sm"
        >
          <p className="font-medium text-yellow-600 mb-2">
            Please verify your email address
          </p>
          <p className="text-muted-foreground mb-3">
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{unverifiedEmail}</span>.
            Please check your inbox and click the link to verify your account.
          </p>
          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="text-sm font-medium text-yellow-600 hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend verification email"}
          </button>
        </div>
      )}

      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1.5"
          >
            Email
          </label>
          <EmailInput
            id="email"
            name="email"
            autoComplete="email"
            required
            error={fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-500">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1.5"
          >
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            error={fieldErrors.password}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
          />
          {fieldErrors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-500">
              {fieldErrors.password}
            </p>
          )}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-red-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-md bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <GitHubButton callbackURL={callbackURL} />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-red-500 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
