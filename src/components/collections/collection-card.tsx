import Link from "next/link";
import { getColorBgClass, getColorTextClass } from "@/lib/color-utils";
import { CollectionCardMenu } from "@/components/collections/collection-card-menu";
import type { CollectionWithStats } from "@/types/dashboard";

function IconBadge({ icon, colorClass }: { icon: string; colorClass: string }) {
  return (
    <span className="w-7 h-7 rounded border border-border bg-muted/30 flex items-center justify-center">
      <span className={`material-symbols-outlined text-sm ${colorClass}`}>{icon}</span>
    </span>
  );
}

interface CollectionCardProps {
  collection: CollectionWithStats;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const borderBgClass = collection.mostUsedType
    ? getColorBgClass(collection.mostUsedType.color)
    : "bg-blue-500";
  const icons = collection.typeIcons || [];

  return (
    <div className="group relative bg-card border border-border rounded-xl p-5 hover:bg-accent/20 transition-all cursor-pointer h-full">
      <div className={`absolute inset-y-4 left-0 w-1 ${borderBgClass} rounded-r-full`}></div>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
        <CollectionCardMenu collection={collection} />
        <Link href={`/collections/${collection.id}`} className="flex items-center">
          <span className="material-symbols-outlined text-muted-foreground group-hover:translate-x-0.5 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>
      <Link href={`/collections/${collection.id}`} className="block">
        <div className="flex justify-between items-start mb-4">
          <div className="pl-2">
            <h3 className="font-semibold text-base">{collection.name}</h3>
            {collection.description && (
              <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2">{collection.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between pl-2 mt-auto">
          <div className="flex gap-2">
            {icons.map((t, i) => (
              <IconBadge key={i} icon={t.icon} colorClass={getColorTextClass(t.color)} />
            ))}
          </div>
          <span className="text-[12px] text-muted-foreground">{collection.resourceCount} resources</span>
        </div>
      </Link>
    </div>
  );
}
