export interface EditorPreferences {
  fontSize: number
  tabSize: number
  wordWrap: boolean
  minimap: boolean
  theme: string
}

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 13,
  tabSize: 4,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark",
}

export const EDITOR_THEMES = [
  { value: "vs-dark", label: "VS Dark" },
  { value: "monokai", label: "Monokai" },
  { value: "github-dark", label: "GitHub Dark" },
] as const

export const FONT_SIZES = [12, 13, 14, 16, 18, 20] as const

export const TAB_SIZES = [2, 4, 8] as const
