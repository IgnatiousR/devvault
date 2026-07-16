"use server";

import { z } from "zod";
import {
  getUserPreferences,
  updateUserPreferences,
} from "@/lib/db/editor-preferences";
import type { EditorPreferences } from "@/types/editor-preferences";
import { getSessionUserId } from "./shared";
import { validateWithFieldErrors } from "@/lib/action-utils";

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
  const validation = validateWithFieldErrors(updatePreferencesSchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  const result = await updateUserPreferences(
    auth.userId,
    validation.data
  );

  return {
    success: true,
    data: result,
  };
}

export async function getEditorPreferencesAction(): Promise<EditorPreferences> {
  const auth = await getSessionUserId();
  if (!("userId" in auth)) {
    throw new Error("Unauthorized");
  }

  return getUserPreferences(auth.userId);
}
