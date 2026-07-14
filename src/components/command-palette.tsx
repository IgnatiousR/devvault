"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { cn } from "@/lib/utils";
import { getColorTextClass } from "@/lib/color-utils";
import type { SearchItem } from "@/lib/db/items";
import type { SearchCollection } from "@/lib/db/collections";

interface SearchData {
  items: SearchItem[];
  collections: SearchCollection[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/search");
      setIsLoading(true);
      if (res.ok) {
        const data = await res.json();
        setSearchData(data);
      }
      setIsLoading(false);
    })();
  }, []);

  function handleItemSelect(item: SearchItem) {
    onOpenChange(false);
    router.push(`/items/${item.itemType.name.toLowerCase()}`);
  }

  function handleCollectionSelect(collection: SearchCollection) {
    onOpenChange(false);
    router.push(`/collections/${collection.id}`);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/80"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2">
        <Command
          className="border bg-popover text-popover-foreground shadow-lg overflow-hidden"
          shouldFilter={!isLoading && !!searchData}
        >
          <div className="flex items-center border-b px-3">
            <span className="material-symbols-outlined text-muted-foreground text-sm mr-2">
              search
            </span>
            <Command.Input
              placeholder="Search items and collections..."
              className="flex h-11 w-full rounded-none bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-100 overflow-y-auto p-2">
            {isLoading && (
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                Loading...
              </Command.Empty>
            )}
            {!isLoading && searchData && (
              <>
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>

                {searchData.items.length > 0 && (
                  <Command.Group heading="Items" className="mb-2">
                    {searchData.items.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={item.title}
                        onSelect={() => handleItemSelect(item)}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                      >
                        <span
                          className={cn(
                            "material-symbols-outlined text-sm",
                            getColorTextClass(item.itemType.color)
                          )}
                        >
                          {item.itemType.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.title}</div>
                          {(item.description || item.content) && (
                            <div className="text-xs text-muted-foreground truncate">
                              {item.description || item.content?.slice(0, 80)}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground capitalize shrink-0">
                          {item.itemType.name}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {searchData.collections.length > 0 && (
                  <Command.Group heading="Collections">
                    {searchData.collections.map((collection) => (
                      <Command.Item
                        key={collection.id}
                        value={collection.name}
                        onSelect={() => handleCollectionSelect(collection)}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                      >
                        <span className="material-symbols-outlined text-sm text-muted-foreground">
                          folder
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{collection.name}</div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
