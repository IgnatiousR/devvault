import type { z } from "zod";

export function validateWithFieldErrors<T extends z.ZodType>(
  schema: T,
  input: unknown
):
  | { success: true; data: z.infer<T> }
  | { success: false; error: string; fieldErrors: Record<string, string> } {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      fieldErrors[field] = issue.message;
    });
    return { success: false, error: "Validation failed", fieldErrors };
  }
  return { success: true, data: result.data };
}

export function validateSimple<T extends z.ZodType>(
  schema: T,
  input: unknown,
  message = "Invalid input"
):
  | { success: true; data: z.infer<T> }
  | { success: false; error: string } {
  const result = schema.safeParse(input);
  if (!result.success) {
    return { success: false, error: message };
  }
  return { success: true, data: result.data };
}

export function notFound(entity: string): { success: false; error: string } {
  return { success: false, error: `${entity} not found` };
}


