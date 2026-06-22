"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { currentUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: "dashboard", label: "All Items", href: "/dashboard" },
    { icon: "code", label: "Snippets", href: "/dashboard/snippets" },
    { icon: "terminal", label: "Prompts", href: "/dashboard/prompts" },
    { icon: "folder", label: "Collections", href: "/dashboard/collections" },
    { icon: "archive", label: "Archive", href: "/dashboard/archive" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="h-16 px-6 border-b border-border flex items-center justify-center">
        <div className="flex items-center gap-2 w-full">
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
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all h-auto",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                  >
                    <span className="material-symbols-outlined opacity-70">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-4 mt-auto">
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
              <Avatar className="w-8 h-8 rounded-md border border-border">
                <AvatarImage src={currentUser.image} alt={currentUser.name} />
                <AvatarFallback className="rounded-md">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
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
      </SidebarFooter>
    </Sidebar>
  );
}

// Keep the export name the same as what layout expects, but redirect it
export { AppSidebar as Sidebar };
