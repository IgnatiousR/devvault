/**
 * Maps hex color values to Tailwind CSS classes for dynamic styling.
 * Used when colors come from the database and can't be known at build time.
 */

const COLOR_MAP: Record<string, { bg: string; bgAlpha: string; text: string }> = {
  "#ef4444": { bg: "bg-[var(--color-brand-red)]", bgAlpha: "bg-[var(--color-brand-red)]/20", text: "text-[var(--color-brand-red)]" },
  "#f97316": { bg: "bg-orange-500", bgAlpha: "bg-orange-500/20", text: "text-orange-500" },
  "#f59e0b": { bg: "bg-amber-500", bgAlpha: "bg-amber-500/20", text: "text-amber-500" },
  "#fde047": { bg: "bg-yellow-500", bgAlpha: "bg-yellow-500/20", text: "text-yellow-500" },
  "#6b7280": { bg: "bg-gray-500", bgAlpha: "bg-gray-500/20", text: "text-gray-500" },
  "#ec4899": { bg: "bg-pink-500", bgAlpha: "bg-pink-500/20", text: "text-pink-500" },
  "#10b981": { bg: "bg-emerald-500", bgAlpha: "bg-emerald-500/20", text: "text-emerald-500" },
  "#3b82f6": { bg: "bg-blue-500", bgAlpha: "bg-blue-500/20", text: "text-blue-500" },
  "#8b5cf6": { bg: "bg-violet-500", bgAlpha: "bg-violet-500/20", text: "text-violet-500" },
  "#06b6d4": { bg: "bg-cyan-500", bgAlpha: "bg-cyan-500/20", text: "text-cyan-500" },
};

const DEFAULT_COLOR = { bg: "bg-blue-500", bgAlpha: "bg-blue-500/20", text: "text-blue-500" };

export function getColorClasses(hexColor: string | null | undefined) {
  if (!hexColor) return DEFAULT_COLOR;
  return COLOR_MAP[hexColor.toLowerCase()] || DEFAULT_COLOR;
}

export function getColorBgClass(hexColor: string | null | undefined): string {
  return getColorClasses(hexColor).bg;
}

export function getColorBgAlphaClass(hexColor: string | null | undefined): string {
  return getColorClasses(hexColor).bgAlpha;
}

export function getColorTextClass(hexColor: string | null | undefined): string {
  return getColorClasses(hexColor).text;
}
