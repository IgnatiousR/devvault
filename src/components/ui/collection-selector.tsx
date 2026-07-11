"use client"

import { useState } from "react"
import { Popover } from "@base-ui/react/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { CaretDownIcon } from "@phosphor-icons/react"

interface Collection {
  id: string
  name: string
}

interface CollectionSelectorProps {
  collections: Collection[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
  className?: string
}

export function CollectionSelector({
  collections,
  selectedIds,
  onChange,
  placeholder = "Select collections...",
  className,
}: CollectionSelectorProps) {
  const [search, setSearch] = useState("")

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedCollections = collections.filter((c) => selectedIds.includes(c.id))

  const toggleCollection = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <Popover.Root>
      <Popover.Trigger
        className={cn(
          "flex w-full items-center justify-between gap-1.5 rounded-none border border-input bg-transparent py-2 pr-2 pl-2.5 text-xs text-left font-normal h-auto min-h-[36px] transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
          className
        )}
      >
        {selectedCollections.length > 0 ? (
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedCollections.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs"
              >
                {c.name}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleCollection(c.id)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation()
                      toggleCollection(c.id)
                    }
                  }}
                  className="hover:text-destructive cursor-pointer"
                >
                  ×
                </span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground flex-1">{placeholder}</span>
        )}
        <CaretDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner sideOffset={4} align="start" className="z-50">
          <Popover.Popup className="w-(--trigger-width) bg-popover border border-border rounded-md shadow-md">
            <div className="p-2 border-b border-border">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search collections..."
                className="w-full px-2 py-1 text-sm bg-transparent border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {filteredCollections.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  {collections.length === 0
                    ? "No collections available"
                    : "No collections found"}
                </div>
              ) : (
                filteredCollections.map((collection) => (
                  <label
                    key={collection.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  >
                    <Checkbox
                      checked={selectedIds.includes(collection.id)}
                      onCheckedChange={() => toggleCollection(collection.id)}
                    />
                    <span className="text-sm">{collection.name}</span>
                  </label>
                ))
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
