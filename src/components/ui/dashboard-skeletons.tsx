import { Skeleton } from "@/components/ui/skeleton";

export function DashboardContentSkeleton() {
  return (
    <div className="space-y-12">
      {/* Stats Cards Skeleton */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </section>

      {/* Collections Skeleton */}
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
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <div className="flex justify-between items-start mb-8">
                <div className="pl-2">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-5" />
              </div>
              <div className="flex gap-2 pl-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="w-7 h-7 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Items Skeleton */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden p-6">
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
          ))}
        </div>
      </section>
    </div>
  );
}

export function ProfileContentSkeleton() {
  return (
    <div className="space-y-8">
      {/* User Info Card Skeleton */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      {/* Stats Section Skeleton */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>

      {/* Item Type Breakdown Skeleton */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions Skeleton */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
