"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { CreateItemDialog } from "@/components/dashboard/create-dialog";
import { CreateCollectionDialog } from "@/components/dashboard/create-collection-dialog";

export function TopBar() {
  const [shortcut, setShortcut] = useState("Ctrl+K");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCollectionCreateOpen, setIsCollectionCreateOpen] = useState(false);

  useEffect(() => {
    const isMac = navigator.userAgent.includes("Mac");
    setShortcut(isMac ? "⌘K" : "Ctrl+K");
  }, []);
  return (
    <>
    <header className="sticky top-0 h-16 shrink-0 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-40 flex items-center justify-between px-4 md:px-8 transition-all ease-linear duration-200">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <SidebarTrigger />
        <InputGroup className="ml-8 h-9 bg-muted/50 rounded-md">
          <InputGroupInput placeholder={`Search... (${shortcut})`} className="text-sm" />
          <InputGroupAddon align="inline-start">
            <span className="material-symbols-outlined text-muted-foreground text-sm">search</span>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1 mr-2">
          <a
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-accent text-accent-foreground"
            href="#"
          >
            Recent
          </a>
          <a
            className="px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all"
            href="#"
          >
            Pinned
          </a>
          <a
            className="px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all"
            href="#"
          >
            Shared
          </a>
        </div>
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
        <Button variant="ghost" size="icon" className="relative">
          <span className="material-symbols-outlined text-lg">
            notifications
          </span>
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 `bg-brand-red rounded-full"></span>
        </Button>
      </div>
    </header>
    <CreateItemDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    <CreateCollectionDialog open={isCollectionCreateOpen} onOpenChange={setIsCollectionCreateOpen} />
    </>
  );
}
