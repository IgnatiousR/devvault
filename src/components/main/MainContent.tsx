"use client";

import { Collection, Item, ItemType } from "@/lib/types";
import { collections, items } from "@/lib/mock-data";

function getCollectionColor(collectionId: string) {
  const map: Record<string, string> = {
    "1": "bg-[var(--color-brand-red)]",
    "2": "bg-orange-500",
    "3": "bg-amber-500",
  };
  return map[collectionId] || "bg-blue-500";
}

function getCollectionIconColor(collectionId: string) {
  const map: Record<string, string> = {
    "1": "text-[var(--color-brand-red)]",
    "2": "text-orange-500",
    "3": "text-amber-500",
  };
  return map[collectionId] || "text-blue-500";
}

function getCollectionIcons(collectionId: string) {
  if (collectionId === "1") return ["code", "notes", "link"];
  if (collectionId === "2") return ["terminal"];
  if (collectionId === "3") return ["keyboard_command_key"];
  return ["description"];
}

const ICON_COLORS: Record<string, string> = {
  "1-notes": "text-yellow-500",
  "2-link": "text-emerald-500",
};

function IconBadge({ icon, index, colorClass }: { icon: string; index: number; colorClass: string }) {
  const key = `${index}-${icon}`;
  const specialColor = ICON_COLORS[key] || colorClass;

  return (
    <span className="w-7 h-7 rounded border border-border bg-muted/30 flex items-center justify-center">
      <span className={`material-symbols-outlined text-sm ${specialColor}`}>{icon}</span>
    </span>
  );
}

function CollectionCard({ collection }: { collection: Collection }) {
  const colorClass = getCollectionColor(collection.id);
  const iconColorClass = getCollectionIconColor(collection.id);
  const icons = getCollectionIcons(collection.id);

  return (
    <div className="group relative bg-card border border-border rounded-xl p-5 hover:bg-accent/20 transition-all cursor-pointer">
      <div className={`absolute inset-y-4 left-0 w-1 ${colorClass} rounded-r-full`}></div>
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
        {icons.map((icon, i) => (
          <IconBadge key={i} icon={icon} index={i} colorClass={iconColorClass} />
        ))}
      </div>
    </div>
  );
}

function getItemTypeIcon(type: ItemType) {
  const map: Record<string, string> = {
    [ItemType.Snippet]: "code",
    [ItemType.Prompt]: "auto_awesome",
    [ItemType.Command]: "terminal",
    [ItemType.Note]: "sticky_note_2",
    [ItemType.Link]: "link",
  };
  return map[type] || "description";
}

function getItemColorClasses(type: ItemType) {
  const map: Record<string, { bg: string; text: string; hoverBorder: string; hoverText: string }> = {
    [ItemType.Snippet]: { bg: "bg-[var(--color-brand-red)]/10", text: "text-[var(--color-brand-red)]", hoverBorder: "hover:border-[var(--color-brand-red)]/30", hoverText: "group-hover:text-[var(--color-brand-red)]" },
    [ItemType.Prompt]: { bg: "bg-orange-500/10", text: "text-orange-500", hoverBorder: "hover:border-orange-500/30", hoverText: "group-hover:text-orange-400" },
    [ItemType.Command]: { bg: "bg-amber-500/10", text: "text-amber-500", hoverBorder: "hover:border-amber-500/30", hoverText: "group-hover:text-amber-400" },
    [ItemType.Note]: { bg: "bg-yellow-500/10", text: "text-yellow-500", hoverBorder: "hover:border-yellow-500/30", hoverText: "group-hover:text-yellow-400" },
    [ItemType.Link]: { bg: "bg-emerald-500/10", text: "text-emerald-500", hoverBorder: "hover:border-emerald-500/30", hoverText: "group-hover:text-emerald-400" },
  };
  return map[type] || { bg: "bg-blue-500/10", text: "text-blue-500", hoverBorder: "hover:border-blue-500/30", hoverText: "group-hover:text-blue-400" };
}

function ItemCard({ item, collectionName }: { item: Item, collectionName: string }) {
  const colors = getItemColorClasses(item.itemType);
  const icon = getItemTypeIcon(item.itemType);

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden hover:ring-1 hover:ring-${colors.text.split('-')[1]}/50 ${colors.hoverBorder} transition-all cursor-pointer group`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className={`w-8 h-8 rounded border border-border ${colors.bg} flex items-center justify-center`}>
            <span className={`material-symbols-outlined ${colors.text} text-[16px]`} style={item.itemType === ItemType.Snippet ? {fontVariationSettings: "'FILL' 1"} : {}}>
              {icon}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {item.itemType}
          </span>
        </div>
        <h4 className={`font-semibold mb-2 ${colors.hoverText} transition-colors`}>{item.title}</h4>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {item.description}
        </p>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-[10px] font-semibold bg-muted/50 px-2 py-0.5 rounded-full border border-border text-muted-foreground uppercase tracking-tight">
            {collectionName}
          </span>
          <span className="text-[11px] text-muted-foreground">{item.relativeTime}</span>
        </div>
      </div>
    </div>
  );
}

export function MainContent() {
  const getCollectionName = (id: string) => collections.find(c => c.id === id)?.name || "Unknown";

  const totalItems = items.length;
  const totalCollections = collections.length;
  const favoriteItems = items.filter(i => i.isFavorite).length;
  const favoriteCollections = collections.filter(c => c.isFavorite).length;

  const pinnedItems = items.filter(i => i.isPinned);

  return (
    <div className="space-y-12">
      {/* Stats Cards Section */}
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

      {pinnedItems.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Pinned Items</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedItems.map(item => (
              <ItemCard key={item.id} item={item} collectionName={getCollectionName(item.collectionId)} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Recent Items</h2>
          <div className="inline-flex items-center bg-muted/50 p-1 rounded-lg border border-border">
            <button className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide bg-background text-foreground rounded shadow-sm border border-border">Grid</button>
            <button className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors">List</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.slice(0, 10).map(item => (
            <ItemCard key={item.id} item={item} collectionName={getCollectionName(item.collectionId)} />
          ))}
        </div>
      </section>
    </div>
  );
}
