"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PasswordInput } from "./password-input";
import { EmailInput } from "./email-input";
import { registerSchema } from "@/lib/schemas";
import { Spinner } from "@/components/ui/spinner";
import { useAuthForm } from "@/hooks/use-auth-form";
import { AuthFormField } from "./auth-form-field";
import { AuthFormDivider } from "./auth-form-divider";

interface RegisterFormProps {
  callbackURL?: string;
  className?: string;
}

export function RegisterForm({ callbackURL = "/dashboard", className }: RegisterFormProps) {
  const {
    error,
    setError,
    loading,
    setLoading,
    fieldErrors,
    resending,
    validate,
    resendVerificationEmail,
  } = useAuthForm({ schema: registerSchema });

  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!validate({ name, email, password, confirmPassword })) {
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
            onClick={() => resendVerificationEmail(registeredEmail)}
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
        <AuthFormField htmlFor="name" label="Name" error={fieldErrors.name}>
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
        </AuthFormField>

        <AuthFormField htmlFor="email" label="Email" error={fieldErrors.email}>
          <EmailInput
            id="email"
            name="email"
            error={fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
        </AuthFormField>

        <AuthFormField htmlFor="password" label="Password" error={fieldErrors.password} hint={!fieldErrors.password ? "Must be at least 8 characters" : undefined}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            error={fieldErrors.password}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
          />
        </AuthFormField>

        <AuthFormField htmlFor="confirmPassword" label="Confirm Password" error={fieldErrors.confirmPassword}>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
            aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined}
          />
        </AuthFormField>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
        >
          {loading && <Spinner size="sm" />}
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <AuthFormDivider callbackURL={callbackURL} />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-red-500 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
