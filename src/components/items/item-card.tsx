"use client";

import { useState } from "react";
import type { DashboardItem } from "@/types/dashboard";
import { formatRelativeTime } from "@/lib/format-utils";
import { getColorBgClass } from "@/lib/color-utils";
import { toast } from "sonner";

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

const COPYABLE_TYPES = new Set(["snippet", "prompt", "command", "note", "link"]);

function getCopyText(item: DashboardItem): string | null {
  const typeName = item.itemType.name.toLowerCase();
  if (!COPYABLE_TYPES.has(typeName)) return null;
  if (typeName === "link") return item.url || null;
  return item.content || null;
}

function CopyButton({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
      title="Copy content"
    >
      <span className="material-symbols-outlined text-[14px] text-muted-foreground">
        {isCopied ? "check" : "content_copy"}
      </span>
    </button>
  );
}

export function ItemCard({ item, onItemClick }: { item: DashboardItem; onItemClick?: (itemId: string) => void }) {
  const colors = getItemColorClasses(item.itemType.name);
  const icon = item.itemType.icon;
  const relativeTime = formatRelativeTime(item.updatedAt);
  const copyText = getCopyText(item);

  return (
    <div
      className={`relative bg-card border border-border rounded-xl overflow-hidden hover:ring-1 hover:ring-${colors.text.split('-')[1]}/50 ${colors.hoverBorder} transition-all cursor-pointer group`}
      onClick={() => onItemClick?.(item.id)}
    >
      <div className={`absolute inset-y-4 left-0 w-1 ${getColorBgClass(item.itemType.color)} rounded-r-full`}></div>
      {item.isPinned && (
        <div className="absolute top-3 right-3">
          <span className="material-symbols-outlined text-blue-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            push_pin
          </span>
        </div>
      )}
      <div className="p-6 pl-8">
        <div className="flex items-center justify-between mb-5">
          <div className={`w-8 h-8 rounded border border-border ${colors.bg} flex items-center justify-center`}>
            <span className={`material-symbols-outlined ${colors.text} text-[16px]`}>
              {icon}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {copyText && <CopyButton text={copyText} />}
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {item.itemType.name}
            </span>
          </div>
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
  const copyText = getCopyText(item);

  return (
    <div
      className={`relative bg-card border border-border rounded-xl p-4 hover:ring-1 hover:ring-${colors.text.split('-')[1]}/50 ${colors.hoverBorder} transition-all cursor-pointer group flex items-center gap-4`}
      onClick={() => onItemClick?.(item.id)}
    >
      <div className={`absolute inset-y-4 left-0 w-1 ${getColorBgClass(item.itemType.color)} rounded-r-full`}></div>
      {item.isPinned && (
        <div className="absolute top-3 right-3">
          <span className="material-symbols-outlined text-blue-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            push_pin
          </span>
        </div>
      )}
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
        {copyText && <CopyButton text={copyText} />}
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
