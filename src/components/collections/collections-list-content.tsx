"use client";

import { CollectionCard } from "@/components/collections/collection-card";
import type { CollectionWithStats } from "@/types/dashboard";

interface CollectionsListContentProps {
  collections: CollectionWithStats[];
}

export function CollectionsListContent({ collections }: CollectionsListContentProps) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {collections.length} {collections.length === 1 ? "collection" : "collections"}
        </p>
      </div>
      {collections.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No collections yet. Create one from the dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
}
