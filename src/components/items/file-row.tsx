import { Download } from "lucide-react";
import type { DashboardItem } from "@/types/dashboard";
import { formatFileSize, formatRelativeTime } from "@/lib/format-utils";

function getFileIcon(fileName: string | null | undefined): string {
  if (!fileName) return "description";
  const ext = fileName.split(".").pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    pdf: "picture_as_pdf",
    txt: "text_snippet",
    md: "text_snippet",
    json: "data_object",
    yaml: "data_object",
    yml: "data_object",
    xml: "code",
    csv: "table_chart",
    toml: "settings",
    ini: "settings",
  };
  return iconMap[ext || ""] || "description";
}

export function FileRow({ item, onItemClick }: { item: DashboardItem; onItemClick?: (itemId: string) => void }) {
  const relativeTime = formatRelativeTime(item.updatedAt);
  const icon = getFileIcon(item.fileName);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/api/items/${item.id}/download`, "_blank");
  };

  return (
    <div
      className="relative bg-card border border-border rounded-xl p-4 hover:bg-muted/50 hover:border-blue-500/30 transition-all cursor-pointer group flex items-center gap-4"
      onClick={() => onItemClick?.(item.id)}
    >
      <div className="absolute inset-y-4 left-0 w-1 bg-blue-500 rounded-r-full" />
      <div className="w-10 h-10 rounded border border-border bg-blue-500/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-blue-500 text-[18px]">
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm group-hover:text-blue-400 transition-colors truncate">
            {item.fileName || item.title}
          </h4>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {item.fileSize != null && (
            <span className="text-[11px] text-muted-foreground">
              {formatFileSize(item.fileSize)}
            </span>
          )}
          {item.collectionName && (
            <span className="text-[10px] font-semibold bg-muted/50 px-2 py-0.5 rounded-full border border-border text-muted-foreground uppercase tracking-tight hidden sm:inline-block">
              {item.collectionName}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[11px] text-muted-foreground whitespace-nowrap hidden sm:block">
          {relativeTime}
        </span>
        <button
          onClick={handleDownload}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
