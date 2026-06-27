"use client";

import { signIn } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { GitHubButton } from "./github-button";
import { cn } from "@/lib/utils";

interface SignInFormProps {
  callbackURL?: string;
  className?: string;
}

interface SignInFieldErrors {
  email?: string;
  password?: string;
}

export function SignInForm({ callbackURL: initialCallbackURL, className }: SignInFormProps) {
  const searchParams = useSearchParams();
  const callbackURL = initialCallbackURL || searchParams.get("callbackUrl") || "/dashboard";
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({});

  const validateForm = (email: string, password: string): boolean => {
    const errors: SignInFieldErrors = {};

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!validateForm(email, password)) {
      setLoading(false);
      return;
    }

    const { error: signInError } = await signIn.email({
      email,
      password,
      callbackURL,
    });

    if (signInError) {
      setError(signInError.message || "Invalid email or password");
      setLoading(false);
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

      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="you@example.com"
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
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="••••••••"
          />
          {fieldErrors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-500">
              {fieldErrors.password}
            </p>
          )}
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
        <Link href="/sign-up" className="text-red-500 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
