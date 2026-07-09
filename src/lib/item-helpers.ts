export function getItemColorClasses(typeName: string) {
  const map: Record<string, { bg: string; text: string; iconBg: string }> = {
    Snippet: {
      bg: "bg-[var(--color-brand-red)]/10",
      text: "text-[var(--color-brand-red)]",
      iconBg: "bg-[var(--color-brand-red)]/20",
    },
    Prompt: {
      bg: "bg-orange-500/10",
      text: "text-orange-500",
      iconBg: "bg-orange-500/20",
    },
    Command: {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      iconBg: "bg-amber-500/20",
    },
    Note: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-500",
      iconBg: "bg-yellow-500/20",
    },
    Link: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      iconBg: "bg-emerald-500/20",
    },
  };
  return (
    map[typeName] || {
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      iconBg: "bg-blue-500/20",
    }
  );
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
