import type { DashboardItem } from "@/types/dashboard";
import { formatRelativeTime } from "@/lib/format-utils";

export function ImageCard({ item, onItemClick }: { item: DashboardItem; onItemClick?: (itemId: string) => void }) {
  const relativeTime = formatRelativeTime(item.updatedAt);
  const hasImage = item.fileUrl;

  return (
    <div
      className="relative bg-card border border-border rounded-xl overflow-hidden hover:ring-1 hover:ring-pink-500/50 hover:border-pink-500/30 transition-all duration-300 cursor-pointer group"
      onClick={() => onItemClick?.(item.id)}
    >
      <div className="aspect-video overflow-hidden">
        {hasImage ? (
          <img
            src={`/api/items/${item.id}/download?inline=true`}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-pink-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-pink-500 text-4xl">
              image
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm group-hover:text-pink-400 transition-colors truncate">
          {item.title}
        </h4>
        <div className="flex items-center justify-between mt-1.5">
          {item.collectionName ? (
            <span className="text-[10px] font-semibold bg-muted/50 px-2 py-0.5 rounded-full border border-border text-muted-foreground uppercase tracking-tight truncate max-w-[120px]">
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
