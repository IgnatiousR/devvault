"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { currentUser } from "@/lib/mock-data";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: "dashboard", label: "All Items", href: "/dashboard" },
    { icon: "code", label: "Snippets", href: "/dashboard/snippets" },
    { icon: "terminal", label: "Prompts", href: "/dashboard/prompts" },
    { icon: "folder", label: "Collections", href: "/dashboard/collections" },
    { icon: "archive", label: "Archive", href: "/dashboard/archive" },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-[var(--spacing-sidebar-width)] bg-background border-r border-border flex flex-col z-50">
      <div className="h-16 flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[var(--color-brand-red)] rounded-md flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              security
            </span>
          </div>
          <span className="font-semibold text-sm tracking-tight">DevVault</span>
        </div>
      </div>
      <div className="px-3 py-2">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                <span className="material-symbols-outlined opacity-70">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-3 space-y-4">
        <div className="px-3">
          <Link
            href="/documentation"
            className="flex items-center gap-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined opacity-70">
              description
            </span>
            <span>Documentation</span>
          </Link>
        </div>
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 min-w-0">
              <Image
                alt={currentUser.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-md object-cover border border-border"
                src={currentUser.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCs9YJawiYwdd6UN9IFmhsgJTh7f2YoILTyO-SGIC_qViqIyjrmLDMfCrMAoCpPcwopOsds8mtaBU_cxVH5bbN3DkeZ526PN5zWVgvL8pEFdtmyvyInO0EVnQyTjDoYhinTbKtuwW0pcbLTzpVts7afCAccj7NMzPPxQd1iiaLrUO1DCks6cFJcv96oTKdLsHhbAxon3F_pvxIJMzMrrLIrjXMkbfwCY6SnWw7DYaxDXBCPhOzQcOZtaBLDYTRKf6FSIYdQQGnF9uA"}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  v2.4.0 • Pro
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-muted-foreground text-sm">
              unfold_more
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
