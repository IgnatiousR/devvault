export interface ItemColorClasses {
  bg: string;
  text: string;
  iconBg: string;
  hoverBorder: string;
  hoverText: string;
}

export function getItemColorClasses(typeName: string): ItemColorClasses {
  const map: Record<string, ItemColorClasses> = {
    Snippet: {
      bg: "bg-[var(--color-brand-red)]/10",
      text: "text-[var(--color-brand-red)]",
      iconBg: "bg-[var(--color-brand-red)]/20",
      hoverBorder: "hover:border-[var(--color-brand-red)]/30",
      hoverText: "group-hover:text-[var(--color-brand-red)]",
    },
    Prompt: {
      bg: "bg-orange-500/10",
      text: "text-orange-500",
      iconBg: "bg-orange-500/20",
      hoverBorder: "hover:border-orange-500/30",
      hoverText: "group-hover:text-orange-400",
    },
    Command: {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      iconBg: "bg-amber-500/20",
      hoverBorder: "hover:border-amber-500/30",
      hoverText: "group-hover:text-amber-400",
    },
    Note: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-500",
      iconBg: "bg-yellow-500/20",
      hoverBorder: "hover:border-yellow-500/30",
      hoverText: "group-hover:text-yellow-400",
    },
    Link: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      iconBg: "bg-emerald-500/20",
      hoverBorder: "hover:border-emerald-500/30",
      hoverText: "group-hover:text-emerald-400",
    },
  };
  return (
    map[typeName] || {
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      iconBg: "bg-blue-500/20",
      hoverBorder: "hover:border-blue-500/30",
      hoverText: "group-hover:text-blue-400",
    }
  );
}

const CONTENT_TYPES = ["snippet", "prompt", "command", "note"];
const LANGUAGE_TYPES_LOWER = ["snippet", "command"];

export function parseTags(tagString: string): string[] {
  return tagString
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export function shouldIncludeContent(typeName: string): boolean {
  return CONTENT_TYPES.includes(typeName.toLowerCase());
}

export function hasLanguage(typeName: string): boolean {
  return LANGUAGE_TYPES_LOWER.includes(typeName.toLowerCase());
}

export function isUrlType(typeName: string): boolean {
  return typeName.toLowerCase() === "link";
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
