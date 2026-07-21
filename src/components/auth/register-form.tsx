"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PasswordInput } from "./password-input";
import { EmailInput } from "./email-input";
import { registerSchema } from "@/lib/schemas";
import { useAuthForm } from "@/hooks/use-auth-form";
import { AuthFormField } from "./auth-form-field";
import { AuthFormDivider } from "./auth-form-divider";
import { RegistrationSuccess } from "./registration-success";
import { FormErrorAlert, FormSubmitButton } from "./auth-form-components";

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
      <RegistrationSuccess
        email={registeredEmail}
        onResend={() => resendVerificationEmail(registeredEmail)}
        resending={resending}
        className={className}
      />
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

      <FormErrorAlert error={error} />

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

        <FormSubmitButton
          loading={loading}
          label="Create Account"
          loadingLabel="Creating account..."
        />
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
