"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardContentSkeleton } from "@/components/ui/dashboard-skeletons";
import type { CollectionWithStats, DashboardItem } from "@/lib/types/dashboard";

function colorToBgClass(color: string): string {
  const map: Record<string, string> = {
    "#ef4444": "bg-[var(--color-brand-red)]",
    "#f97316": "bg-orange-500",
    "#f59e0b": "bg-amber-500",
    "#fde047": "bg-yellow-500",
    "#6b7280": "bg-gray-500",
    "#ec4899": "bg-pink-500",
    "#10b981": "bg-emerald-500",
  };
  return map[color] || "bg-blue-500";
}

function colorToTextClass(color: string): string {
  const map: Record<string, string> = {
    "#ef4444": "text-[var(--color-brand-red)]",
    "#f97316": "text-orange-500",
    "#f59e0b": "text-amber-500",
    "#fde047": "text-yellow-500",
    "#6b7280": "text-gray-500",
    "#ec4899": "text-pink-500",
    "#10b981": "text-emerald-500",
  };
  return map[color] || "text-blue-500";
}

function IconBadge({ icon, colorClass }: { icon: string; colorClass: string }) {
  return (
    <span className="w-7 h-7 rounded border border-border bg-muted/30 flex items-center justify-center">
      <span className={`material-symbols-outlined text-sm ${colorClass}`}>{icon}</span>
    </span>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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

interface StatsCardsProps {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

function StatsCards({ totalItems, totalCollections, favoriteItems, favoriteCollections }: StatsCardsProps) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground mb-1">Total Items</p>
        <p className="text-2xl font-bold">{totalItems}</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground mb-1">Total Collections</p>
        <p className="text-2xl font-bold">{totalCollections}</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground mb-1">Favorite Items</p>
        <p className="text-2xl font-bold">{favoriteItems}</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground mb-1">Favorite Collections</p>
        <p className="text-2xl font-bold">{favoriteCollections}</p>
      </div>
    </section>
  );
}

function CollectionCard({ collection }: { collection: CollectionWithStats }) {
  const borderBgClass = collection.mostUsedType
    ? colorToBgClass(collection.mostUsedType.color)
    : "bg-blue-500";
  const icons = collection.typeIcons || [];

  return (
    <div className="group relative bg-card border border-border rounded-xl p-5 hover:bg-accent/20 transition-all cursor-pointer">
      <div className={`absolute inset-y-4 left-0 w-1 ${borderBgClass} rounded-r-full`}></div>
      <div className="flex justify-between items-start mb-8">
        <div className="pl-2">
          <h3 className="font-semibold text-base">{collection.name}</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">{collection.resourceCount} resources</p>
        </div>
        <span className="material-symbols-outlined text-muted-foreground group-hover:translate-x-0.5 transition-transform">
          arrow_forward
        </span>
      </div>
      <div className="flex gap-2 pl-2">
        {icons.map((t, i) => (
          <IconBadge key={i} icon={t.icon} colorClass={colorToTextClass(t.color)} />
        ))}
      </div>
    </div>
  );
}

interface RecentCollectionsSectionProps {
  collections: CollectionWithStats[];
}

function RecentCollectionsSection({ collections }: RecentCollectionsSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Recent Collections</h2>
          <p className="text-sm text-muted-foreground mt-1">Organize your resources by project or technology.</p>
        </div>
        <button className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
          View all <span className="material-symbols-outlined text-xs">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {collections.map(collection => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  );
}

function ViewToggle({ mode, onChange }: { mode: "grid" | "list"; onChange: (mode: "grid" | "list") => void }) {
  return (
    <div className="inline-flex items-center bg-muted/50 p-1 rounded-lg border border-border">
      <button
        onClick={() => onChange("grid")}
        className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wide rounded transition-colors ${
          mode === "grid"
            ? "bg-background text-foreground shadow-sm border border-border"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Grid
      </button>
      <button
        onClick={() => onChange("list")}
        className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wide rounded transition-colors ${
          mode === "list"
            ? "bg-background text-foreground shadow-sm border border-border"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        List
      </button>
    </div>
  );
}

function ItemCard({ item }: { item: DashboardItem }) {
  const colors = getItemColorClasses(item.itemType.name);
  const icon = item.itemType.icon;
  const relativeTime = formatRelativeTime(item.updatedAt);

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden hover:ring-1 hover:ring-${colors.text.split('-')[1]}/50 ${colors.hoverBorder} transition-all cursor-pointer group`}>
      <div className="p-6">
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

function ListItem({ item }: { item: DashboardItem }) {
  const colors = getItemColorClasses(item.itemType.name);
  const icon = item.itemType.icon;
  const relativeTime = formatRelativeTime(item.updatedAt);

  return (
    <div className={`bg-card border border-border rounded-xl p-4 hover:ring-1 hover:ring-${colors.text.split('-')[1]}/50 ${colors.hoverBorder} transition-all cursor-pointer group flex items-center gap-4`}>
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

interface ItemsSectionProps {
  title: string;
  items: DashboardItem[];
}

function ItemsSection({ title, items }: ItemsSectionProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <ViewToggle mode={viewMode} onChange={setViewMode} />
      </div>
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
        {items.map(item => (
          viewMode === "grid" ? (
            <ItemCard key={item.id} item={item} />
          ) : (
            <ListItem key={item.id} item={item} />
          )
        ))}
      </div>
    </section>
  );
}

export function MainContent() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return <DashboardContentSkeleton />;
  }

  return (
    <div className="space-y-12">
      <StatsCards
        totalItems={data.itemCounts.totalItems}
        totalCollections={data.totalCollections}
        favoriteItems={data.itemCounts.favoriteItems}
        favoriteCollections={data.favoriteCollections}
      />
      <RecentCollectionsSection collections={data.collections} />
      {data.pinnedItems.length > 0 && (
        <ItemsSection title="Pinned Items" items={data.pinnedItems} />
      )}
      <ItemsSection title="Recent Items" items={data.recentItems} />
    </div>
  );
}
