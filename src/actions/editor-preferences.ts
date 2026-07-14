"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getUserPreferences,
  updateUserPreferences,
} from "@/lib/db/editor-preferences";
import type { EditorPreferences } from "@/types/editor-preferences";

const updatePreferencesSchema = z.object({
  fontSize: z.number().min(8).max(32),
  tabSize: z.number().min(2).max(8),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(["vs-dark", "monokai", "github-dark"]),
});

type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

interface UpdatePreferencesResult {
  success: boolean;
  data?: EditorPreferences;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function updateEditorPreferencesAction(
  input: UpdatePreferencesInput
): Promise<UpdatePreferencesResult> {
  const validation = updatePreferencesSchema.safeParse(input);

  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      fieldErrors[field] = issue.message;
    });
    return {
      success: false,
      error: "Validation failed",
      fieldErrors,
    };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await updateUserPreferences(
    session.user.id,
    validation.data
  );

  return {
    success: true,
    data: result,
  };
}

export async function getEditorPreferencesAction(): Promise<EditorPreferences> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return getUserPreferences(session.user.id);
}
