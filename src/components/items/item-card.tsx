import type { DashboardItem } from "@/types/dashboard";
import { formatRelativeTime } from "@/lib/format-utils";
import { getColorBgClass } from "@/lib/color-utils";

function getItemColorClasses(typeName: string) {
  const map: Record<string, { bg: string; text: string; hoverBorder: string; hoverText: string }> = {
    "Snippet": { bg: "bg-[var(--color-brand-red)]/10", text: "text-[var(--color-brand-red)]", hoverBorder: "hover:border-[var(--color-brand-red)]/30", hoverText: "group-hover:text-[var(--color-brand-red)]" },
    "Prompt": { bg: "bg-orange-500/10", text: "text-orange-500", hoverBorder: "hover:border-orange-500/30", hoverText: "group-hover:text-orange-400" },
    "Command": { bg: "bg-amber-500/10", text: "text-amber-500", hoverBorder: "hover:border-amber-500/30", hoverText: "group-hover:text-amber-400" },
    "Note": { bg: "bg-yellow-500/10", text: "text-yellow-500", hoverBorder: "hover:border-yellow-500/30", hoverText: "group-hover:text-yellow-400" },
    "Link": { bg: "bg-emerald-500/10", text: "text-emerald-500", hoverBorder: "hover:border-emerald-500/30", hoverText: "group-hover:text-emerald-400" },
  };
  return map[typeName] || { bg: "bg-blue-500/10", text: "text-blue-500", hoverBorder: "hover:border-blue-500/30", hoverText: "group-hover:text-blue-400" };
}

export function ItemCard({ item, onItemClick }: { item: DashboardItem; onItemClick?: (itemId: string) => void }) {
  const colors = getItemColorClasses(item.itemType.name);
  const icon = item.itemType.icon;
  const relativeTime = formatRelativeTime(item.updatedAt);

  return (
    <div
      className={`relative bg-card border border-border rounded-xl overflow-hidden hover:ring-1 hover:ring-${colors.text.split('-')[1]}/50 ${colors.hoverBorder} transition-all cursor-pointer group`}
      onClick={() => onItemClick?.(item.id)}
    >
      <div className={`absolute inset-y-4 left-0 w-1 ${getColorBgClass(item.itemType.color)} rounded-r-full`}></div>
      <div className="p-6 pl-8">
        <div className="flex items-center justify-between mb-5">
          <div className={`w-8 h-8 rounded border border-border ${colors.bg} flex items-center justify-center`}>
            <span className={`material-symbols-outlined ${colors.text} text-[16px]`}>
              {icon}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {item.itemType.name}
          </span>
        </div>
        <h4 className={`font-semibold mb-2 ${colors.hoverText} transition-colors`}>{item.title}</h4>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {item.description}
        </p>
        <div className="mt-6 flex items-center justify-between">
          {item.collectionName ? (
            <span className="text-[10px] font-semibold bg-muted/50 px-2 py-0.5 rounded-full border border-border text-muted-foreground uppercase tracking-tight">
              {item.collectionName}
            </span>
          ) : (
            <span />
          )}
          <span className="text-[11px] text-muted-foreground">{relativeTime}</span>
        </div>
      </div>
    </div>
  );
}

export function ListItem({ item, onItemClick }: { item: DashboardItem; onItemClick?: (itemId: string) => void }) {
  const colors = getItemColorClasses(item.itemType.name);
  const icon = item.itemType.icon;
  const relativeTime = formatRelativeTime(item.updatedAt);

  return (
    <div
      className={`relative bg-card border border-border rounded-xl p-4 hover:ring-1 hover:ring-${colors.text.split('-')[1]}/50 ${colors.hoverBorder} transition-all cursor-pointer group flex items-center gap-4`}
      onClick={() => onItemClick?.(item.id)}
    >
      <div className={`absolute inset-y-4 left-0 w-1 ${getColorBgClass(item.itemType.color)} rounded-r-full`}></div>
      <div className={`w-10 h-10 rounded border border-border ${colors.bg} flex items-center justify-center shrink-0`}>
        <span className={`material-symbols-outlined ${colors.text} text-[18px]`}>
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`font-semibold ${colors.hoverText} transition-colors truncate`}>{item.title}</h4>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
            {item.itemType.name}
          </span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-1 mt-0.5">
          {item.description}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {item.collectionName && (
          <span className="text-[10px] font-semibold bg-muted/50 px-2 py-0.5 rounded-full border border-border text-muted-foreground uppercase tracking-tight hidden md:inline-block">
            {item.collectionName}
          </span>
        )}
        <span className="text-[11px] text-muted-foreground whitespace-nowrap">{relativeTime}</span>
      </div>
    </div>
  );
}
