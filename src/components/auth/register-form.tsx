"use client";

import { signUp, sendVerificationEmail } from "@/lib/auth-client";
import { useState } from "react";
import Link from "next/link";
import { GitHubButton } from "./github-button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RegisterFormProps {
  callbackURL?: string;
  className?: string;
}

export function RegisterForm({ callbackURL = "/dashboard", className }: RegisterFormProps) {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  const [resending, setResending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): boolean => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name) {
      errors.name = "Name is required";
    }

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!validateForm(name, email, password, confirmPassword)) {
      setLoading(false);
      return;
    }

    const { error: signUpError } = await signUp.email({
      name,
      email,
      password,
      callbackURL,
    });

    if (signUpError) {
      if (signUpError.message?.includes("already")) {
        setError("An account with this email already exists");
      } else {
        setError(signUpError.message || "Registration failed");
      }
      setLoading(false);
    } else {
      setRegisteredEmail(email);
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    const { error } = await sendVerificationEmail({
      email: registeredEmail,
      callbackURL: "/dashboard",
    });
    setResending(false);

    if (error) {
      toast.error("Failed to resend verification email", {
        description: error.message || "Please try again later",
      });
    } else {
      toast.success("Verification email sent", {
        description: `We've sent a new verification link to ${registeredEmail}`,
      });
    }
  };

  if (registeredEmail) {
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
          <span className="font-medium text-foreground">{registeredEmail}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Click the link in the email to verify your account. The link will expire in 24 hours.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend verification email"}
          </button>
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

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground">
          Start building your developer vault
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

      <form onSubmit={handleEmailSignUp} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-1.5"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="John Doe"
          />
          {fieldErrors.name && (
            <p id="name-error" className="mt-1 text-xs text-red-500">
              {fieldErrors.name}
            </p>
          )}
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="••••••••"
          />
          {fieldErrors.password ? (
            <p id="password-error" className="mt-1 text-xs text-red-500">
              {fieldErrors.password}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium mb-1.5"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={!!fieldErrors.confirmPassword}
            aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="••••••••"
          />
          {fieldErrors.confirmPassword && (
            <p id="confirm-password-error" className="mt-1 text-xs text-red-500">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-md bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
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
        Already have an account?{" "}
        <Link href="/login" className="text-red-500 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
