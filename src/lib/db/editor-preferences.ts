import { prisma } from "@/lib/prisma"
import {
  EditorPreferences,
  DEFAULT_EDITOR_PREFERENCES,
} from "@/types/editor-preferences"
import { Prisma } from "../../../generated/prisma/client"

export async function getUserPreferences(
  userId: string
): Promise<EditorPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      editorPreferences: true,
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const prefs = user.editorPreferences as Record<string, unknown> | null

  if (!prefs || Object.keys(prefs).length === 0) {
    return DEFAULT_EDITOR_PREFERENCES
  }

  return {
    fontSize: typeof prefs.fontSize === "number" ? prefs.fontSize : DEFAULT_EDITOR_PREFERENCES.fontSize,
    tabSize: typeof prefs.tabSize === "number" ? prefs.tabSize : DEFAULT_EDITOR_PREFERENCES.tabSize,
    wordWrap: typeof prefs.wordWrap === "boolean" ? prefs.wordWrap : DEFAULT_EDITOR_PREFERENCES.wordWrap,
    minimap: typeof prefs.minimap === "boolean" ? prefs.minimap : DEFAULT_EDITOR_PREFERENCES.minimap,
    theme: typeof prefs.theme === "string" ? prefs.theme : DEFAULT_EDITOR_PREFERENCES.theme,
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: EditorPreferences
): Promise<EditorPreferences> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      editorPreferences: preferences as unknown as Prisma.InputJsonValue,
    },
  })

  return preferences
}
