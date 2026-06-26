import { Skeleton } from "@/components/ui/skeleton";

export function StatsCardsSkeleton() {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </section>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex justify-between items-start mb-8">
        <div className="pl-2">
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-5" />
      </div>
      <div className="flex gap-2 pl-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-7 h-7 rounded" />
        ))}
      </div>
    </div>
  );
}

export function CollectionsSkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CollectionCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden p-6">
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-5 w-40 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4" />
      <div className="mt-6 flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function ItemsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function DashboardContentSkeleton() {
  return (
    <div className="space-y-12">
      <StatsCardsSkeleton />
      <CollectionsSkeleton />
      <ItemsSkeleton count={3} />
      <ItemsSkeleton count={6} />
    </div>
  );
}
