"use client";

import { useState } from "react";

export function Header() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="fixed top-0 left-64 h-16 border-b border-[#27272a] bg-[#0a0a0a]/80 backdrop-blur-md z-40 flex items-center justify-between px-8">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {searchFocused ? "search" : (
            <svg viewBox="3 6 10 9" className="w-4 h-4">
              <path fill="currentColor" d="M8.923 1 5.25 3.75l2.218 2.218-.82.82L4.25 4.6v5h1.75l4.063-3.935zM12 6c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5z" />
            </svg>
          )}
        </span>
        <input
          className={`w-full h-9 bg-[#1c1c1c] border ${
            searchFocused ? "border-red-500 ring-1 ring-red-500" : "border-[#27272a]"
          } rounded-md pl-10 pr-4 text-sm focus:outline-none transition-all`}
          placeholder="Search Vault... (⌘+K)"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Navigation tabs - desktop only */}
        <div className="hidden md:flex items-center gap-6 mr-4">
          {["Recent", "Pinned", "Shared"].map((tab) => (
            <a
              key={tab}
              href="#"
              className={`text-sm font-medium transition-colors h-16 flex items-center ${
                tab === "Recent" ? "text-white border-b-2 border-red-500" : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </a>
          ))}
        </div>

        {/* New Collection button */}
        <button className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium border border-[#27272a] bg-[#0a0a0a] hover:bg-[#27272a]/50 transition-colors rounded-md">
          New Collection
        </button>

        {/* New Item button */}
        <button className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium bg-red-500 text-white hover:bg-red-600/90 transition-colors rounded-md shadow-sm">
          New Item
        </button>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-[#27272a] mx-2" />

        {/* Notifications */}
        <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.75-7.11L12 3l-1.25 1.89C7.63 9.36 6 11.92 6 15v5c0 1.1.9 2 2 2zm0-10V6l4.25-2.89A4.933 4.933 0 0117 8v3z"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
