type Compute = (m: number, h: number, d: number) => string;

const rules: [condition: (m: number, h: number, d: number) => boolean, compute: Compute | string][] = [
  [(m) => m < 1, "just now"],
  [(m) => m < 60, (m) => `${m}m ago`],
  [(_m, h) => h < 24, (_m, h) => `${h}h ago`],
  [(_m, _h, d) => d === 0, "today"],
  [(_m, _h, d) => d === 1, "yesterday"],
  [(_m, _h, d) => d < 7, (_m, _h, d) => `${d}d ago`],
  [(_m, _h, d) => d < 30, (_m, _h, d) => `${Math.floor(d / 7)}w ago`],
  [(_m, _h, d) => d < 365, (_m, _h, d) => `${Math.floor(d / 30)}mo ago`],
];

export function formatRelativeTime(dateString: string | Date): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  for (const [condition, compute] of rules) {
    if (condition(diffMins, diffHours, diffDays)) {
      return typeof compute === "string" ? compute : compute(diffMins, diffHours, diffDays);
    }
  }

  return `${Math.floor(diffDays / 365)}y ago`;
}
