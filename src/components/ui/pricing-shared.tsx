import { Checks, X } from "@phosphor-icons/react";

interface Feature { text: string; included: boolean }

export function FreeFeatureList({ features }: { features: Feature[] }) {
  return (
    <ul className="space-y-3 text-sm">
      {features.map((f) => (
        <li
          key={f.text}
          className={`flex items-center gap-3 ${f.included ? "text-gray-300" : "text-muted-foreground"}`}
        >
          {f.included ? (
            <Checks className="size-4 text-emerald-400 shrink-0" />
          ) : (
            <X className="size-4 text-gray-600 shrink-0" />
          )}
          {f.text}
        </li>
      ))}
    </ul>
  );
}

interface ProFeature { text: string; bold?: boolean; highlight?: boolean }

export function ProFeatureList({ features }: { features: ProFeature[] }) {
  return (
    <ul className="space-y-3 text-sm">
      {features.map((f) => (
        <li key={f.text} className="flex items-center gap-3 text-gray-200">
          <Checks className="size-4 text-emerald-400 shrink-0" />
          <span className={f.bold ? "font-semibold" : ""}>{f.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function PricingToggle({ yearly, onChange }: { yearly: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <span className={`text-sm font-medium transition-colors ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>
        Monthly
      </span>
      <button
        onClick={() => onChange(!yearly)}
        className={`relative w-14 h-7.5 rounded-full transition-colors ${yearly ? "bg-linear-to-r from-red-500 to-red-600" : "bg-white/10"}`}
        role="switch"
        aria-checked={yearly}
      >
        <div className={`absolute top-0.75 left-0.75 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${yearly ? "translate-x-6.5" : ""}`} />
      </button>
      <span className={`text-sm font-medium transition-colors flex items-center gap-2 ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
        Yearly
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">SAVE 25%</span>
      </span>
    </div>
  );
}
