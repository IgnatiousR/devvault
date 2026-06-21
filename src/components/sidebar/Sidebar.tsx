"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { currentUser } from "@/lib/mock-data";
import {
  DashboardOutlineSharpIcon,
  CodeOutlineSharpIcon,
  TerminalIconSharp,
  FolderIcon,
} from "../icons/Icon";
import Image from "next/image";

export function Sidebar() {
  const router = useRouter();

  const menuItems = [
    {
      icon: <DashboardOutlineSharpIcon />,
      label: "All Items",
      href: "/dashboard",
    },
    {
      icon: <CodeOutlineSharpIcon />,
      label: "Snippets",
      href: "#",
    },
    {
      icon: <TerminalIconSharp />,
      label: "Prompts",
      href: "#",
    },
    {
      icon: <FolderIcon />,
      label: "Collections",
      href: "#",
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#0a0a0a] border-r border-[#27272a] flex flex-col z-50">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded-md flex items-center justify-center">
            {currentUser.name === "Alex Rivera" && (
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.81z" />
              </svg>
            )}
          </div>
          <span className="font-semibold text-lg tracking-tight">DevVault</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              item.href === "/dashboard"
                ? "bg-[#27272a] text-white"
                : "text-gray-400 hover:text-white hover:bg-[#27272a]/50"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[#27272a]">
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-400 hover:text-white hover:bg-[#27272a]/50 mb-4"
        >
          {currentUser.name === "Alex Rivera" && (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M3 13h2v-2h4v2h4V7H5v6zm0 8h14v-2H3v2z" />
            </svg>
          )}
          <span>Documentation</span>
        </Link>

        {/* User Profile */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#1c1c1c] border border-[#27272a]">
          <div className="flex items-center gap-3">
            {currentUser.image && (
              <Image
                alt={currentUser.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border border-[#27272a]"
                src={currentUser.image}
              />
            )}
            <div className="flex flex-col">
              <span className="text-xs font-semibold">{currentUser.name}</span>
              <span className="text-[10px] text-gray-400">Pro Plan</span>
            </div>
          </div>
          <button className="p-1 hover:bg-[#0a0a0a] rounded-md transition-colors">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="1.5" />
              <path d="M3 12h.01M12 3v.01M12 21v.01M21 12h-.01M17.66 7.66l-1.41 1.41M9.84 16.5l-1.41 1.41M2.34 8.34l1.41 1.41M16.5 9.84l1.41 1.41" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
