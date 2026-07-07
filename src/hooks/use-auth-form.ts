"use client";

import { useState } from "react";
import { sendVerificationEmail } from "@/lib/auth-client";
import { toast } from "sonner";
import { type ZodType, type ZodObject } from "zod";

type FieldErrors = Record<string, string>;

interface UseAuthFormOptions<T extends ZodObject> {
  schema: T;
}

export function useAuthForm<T extends ZodObject>({ schema }: UseAuthFormOptions<T>) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [resending, setResending] = useState(false);

  const validate = (data: Record<string, unknown>): boolean => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field) {
          errors[field] = issue.message;
        }
      });
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const resendVerificationEmail = async (email: string, callbackURL = "/dashboard") => {
    setResending(true);
    const { error } = await sendVerificationEmail({ email, callbackURL });
    setResending(false);

    if (error) {
      toast.error("Failed to resend verification email", {
        description: error.message || "Please try again later",
      });
    } else {
      toast.success("Verification email sent", {
        description: `We've sent a new verification link to ${email}`,
      });
    }
  };

  return {
    error,
    setError,
    loading,
    setLoading,
    fieldErrors,
    setFieldErrors,
    resending,
    validate,
    resendVerificationEmail,
  };
}
