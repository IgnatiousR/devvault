"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/dashboard/top-bar";
import { CommandPalette } from "@/components/command-palette";
import { SearchContext } from "@/components/dashboard/search-context";

export function SearchWrapper() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <SearchContext.Provider value={{ openSearch: () => setIsSearchOpen(true) }}>
      <TopBar />
      <CommandPalette open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </SearchContext.Provider>
  );
}
