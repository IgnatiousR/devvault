"use client";

import { useState } from "react";
import { useItemDetail } from "@/hooks/use-item-detail";
import { DashboardContentSkeleton } from "@/components/ui/dashboard-skeletons";
import { Button } from "@/components/ui/button";
import { ItemCard, ListItem } from "@/components/items/item-card";
import { ItemDrawer } from "@/components/items/drawer";
import { getColorBgClass, getColorTextClass } from "@/lib/color-utils";
import type { CollectionWithStats, DashboardItem, DashboardData } from "@/types/dashboard";

function IconBadge({ icon, colorClass }: { icon: string; colorClass: string }) {
  return (
    <span className="w-7 h-7 rounded border border-border bg-muted/30 flex items-center justify-center">
      <span className={`material-symbols-outlined text-sm ${colorClass}`}>{icon}</span>
    </span>
  );
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
    ? getColorBgClass(collection.mostUsedType.color)
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
          <IconBadge key={i} icon={t.icon} colorClass={getColorTextClass(t.color)} />
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
        <Button variant="ghost" className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
          View all <span className="material-symbols-outlined text-xs">chevron_right</span>
        </Button>
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
      <Button
        variant="ghost"
        onClick={() => onChange("grid")}
        className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wide rounded transition-colors ${
          mode === "grid"
            ? "bg-background text-foreground shadow-sm border border-border"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Grid
      </Button>
      <Button
        variant="ghost"
        onClick={() => onChange("list")}
        className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wide rounded transition-colors ${
          mode === "list"
            ? "bg-background text-foreground shadow-sm border border-border"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        List
      </Button>
    </div>
  );
}

interface ItemsSectionProps {
  title: string;
  items: DashboardItem[];
  onItemClick?: (itemId: string) => void;
}

function ItemsSection({ title, items, onItemClick }: ItemsSectionProps) {
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
            <ItemCard key={item.id} item={item} onItemClick={onItemClick} />
          ) : (
            <ListItem key={item.id} item={item} onItemClick={onItemClick} />
          )
        ))}
      </div>
    </section>
  );
}

export function MainContent({ initialData }: { initialData: DashboardData }) {
  const data = initialData;
  const { data: selectedItem, isLoading: isDrawerLoading, error: drawerError, open: openDrawer, close: closeDrawer, isOpen: isDrawerOpen } = useItemDetail();

  if (!data) {
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
        <ItemsSection title="Pinned Items" items={data.pinnedItems} onItemClick={openDrawer} />
      )}
      <ItemsSection title="Recent Items" items={data.recentItems} onItemClick={openDrawer} />
      <ItemDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        item={selectedItem}
        isLoading={isDrawerLoading}
        error={drawerError}
      />
    </div>
  );
}
