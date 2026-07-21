"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PasswordInput } from "./password-input";
import { EmailInput } from "./email-input";
import { signInSchema } from "@/lib/schemas";
import { useAuthForm } from "@/hooks/use-auth-form";
import { AuthFormField } from "./auth-form-field";
import { AuthFormDivider } from "./auth-form-divider";
import { UnverifiedEmailBanner } from "./unverified-email-banner";
import { FormErrorAlert, FormSubmitButton } from "./auth-form-components";

interface SignInFormProps {
  callbackURL?: string;
  className?: string;
}

export function SignInForm({ callbackURL: initialCallbackURL, className }: SignInFormProps) {
  const searchParams = useSearchParams();
  const callbackURL = initialCallbackURL || searchParams.get("callbackUrl") || "/dashboard";

  const {
    error,
    setError,
    loading,
    setLoading,
    fieldErrors,
    resending,
    validate,
    resendVerificationEmail,
  } = useAuthForm({ schema: signInSchema });

  const [unverifiedEmail, setUnverifiedEmail] = useState<string>("");

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!validate({ email, password })) {
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

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Sign in to DevVault</h1>
        <p className="text-muted-foreground">
          Access your developer toolkit
        </p>
      </div>

      <FormErrorAlert error={error} />

      {unverifiedEmail && (
        <UnverifiedEmailBanner
          email={unverifiedEmail}
          onResend={() => resendVerificationEmail(unverifiedEmail)}
          resending={resending}
        />
      )}

      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <AuthFormField htmlFor="email" label="Email" error={fieldErrors.email}>
          <EmailInput
            id="email"
            name="email"
            autoComplete="email"
            required
            error={fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
        </AuthFormField>

        <div>
          <AuthFormField htmlFor="password" label="Password" error={fieldErrors.password}>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              error={fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
          </AuthFormField>
          <div className="text-right mt-2">
            <Link
              href="/forgot-password"
              className="text-xs text-red-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <FormSubmitButton
          loading={loading}
          label="Sign In"
          loadingLabel="Signing in..."
        />
      </form>

      <AuthFormDivider callbackURL={callbackURL} />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-red-500 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
