"use client";

interface EmailInputProps {
  id: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  "aria-describedby"?: string;
}

export function EmailInput({
  id,
  name,
  value,
  onChange,
  placeholder = "you@example.com",
  autoComplete = "email",
  required = false,
  error,
  "aria-describedby": ariaDescribedBy,
}: EmailInputProps) {
  return (
    <input
      id={id}
      name={name}
      type="email"
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      required={required}
      aria-invalid={!!error}
      aria-describedby={ariaDescribedBy}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      placeholder={placeholder}
    />
  );
}