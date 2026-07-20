"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { CreateItemDialog } from "@/components/dashboard/create-dialog";
import { CreateCollectionDialog } from "@/components/dashboard/create-collection-dialog";
import { useSearch } from "@/components/dashboard/search-context";

export function TopBar({ isPro }: { isPro: boolean }) {
  const { openSearch } = useSearch();
  const [shortcut] = useState(() => {
    if (typeof navigator !== "undefined") {
      return navigator.userAgent.includes("Mac") ? "⌘K" : "Ctrl+K";
    }
    return "Ctrl+K";
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCollectionCreateOpen, setIsCollectionCreateOpen] = useState(false);

  return (
    <>
    <header className="sticky top-0 h-16 shrink-0 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-40 flex items-center justify-between px-4 md:px-8 transition-all ease-linear duration-200">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <SidebarTrigger />
        <InputGroup className="ml-8 h-9 bg-muted/50 rounded-md cursor-pointer" onClick={openSearch}>
          <InputGroupInput placeholder={`Search... (${shortcut})`} className="text-sm cursor-pointer" readOnly tabIndex={-1} />
          <InputGroupAddon align="inline-start">
            <span className="material-symbols-outlined text-muted-foreground text-sm">search</span>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex items-center gap-3">
        {!isPro && (
          <Link href="/dashboard/upgrade">
            <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
              Upgrade
            </Button>
          </Link>
        )}
        <Button
          variant="outline"
          className="h-9 px-4 text-sm font-medium btn-outline"
          onClick={() => setIsCollectionCreateOpen(true)}
        >
          New Collection
        </Button>
        <Button
          className="h-9 px-4 text-sm font-medium btn-primary text-white"
          onClick={() => setIsCreateOpen(true)}
        >
          New Item
        </Button>
        <div className="h-4 w-px bg-border mx-1"></div>
        <Link
          href="/favorites"
          aria-label="Favorites"
          className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <span className="material-symbols-outlined text-lg">
            star
          </span>
        </Link>
      </div>
    </header>
    <CreateItemDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} aiAccess={isPro} />
    <CreateCollectionDialog open={isCollectionCreateOpen} onOpenChange={setIsCollectionCreateOpen} />
    </>
  );
}
