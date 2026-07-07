import { ReactNode } from "react";

interface AuthFormFieldProps {
  htmlFor: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function AuthFormField({ htmlFor, label, error, hint, children }: AuthFormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="mt-1 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
