"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { currentUser, collections } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MENU_ITEMS = [
  { icon: "inventory_2", label: "All Items", href: "/items" },
  { icon: "code", label: "Snippets", href: "/items/snippets" },
  { icon: "terminal", label: "Prompts", href: "/items/prompts" },
  { icon: "folder_special", label: "Collections", href: "/collections" },
];

function SidebarLogo() {
  return (
    <SidebarHeader className="h-16 px-6 group-data-[collapsible=icon]:px-2 border-b border-border flex items-center justify-center">
      <div className="flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center">
        <div className="w-6 h-6 shrink-0 `bg-brand-red rounded-md flex items-center justify-center">
          <span
            className="material-symbols-outlined text-white text-[14px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            security
          </span>
        </div>
        <span className="font-semibold text-sm tracking-tight group-data-[collapsible=icon]:hidden">
          DevVault
        </span>
      </div>
    </SidebarHeader>
  );
}

function NavigationMenu() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                isActive={isActive}
                tooltip={item.label}
                className={cn(
                  "font-medium text-sm transition-all",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                <span className="material-symbols-outlined opacity-70 shrink-0">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function FavoritesMenu() {
  const favorites = collections.filter((c) => c.isFavorite);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
        Favorites
      </SidebarGroupLabel>
      <SidebarMenu>
        {favorites.map((collection) => (
          <SidebarMenuItem key={collection.id}>
            <SidebarMenuButton
              render={<Link href={`/collections/${collection.id}`} />}
              tooltip={collection.name}
              className="font-medium text-sm transition-all text-muted-foreground"
            >
              <span className="w-2 h-2 shrink-0 rounded-full `bg-brand-red"></span>
              <span>{collection.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function RecentCollectionsMenu() {
  const recent = collections.slice(0, 3);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
        Recent Collections
      </SidebarGroupLabel>
      <SidebarMenu>
        {recent.map((collection) => (
          <SidebarMenuItem key={collection.id}>
            <SidebarMenuButton
              render={<Link href={`/collections/${collection.id}`} />}
              tooltip={collection.name}
              className="font-medium text-sm transition-all text-muted-foreground"
            >
              <span className="material-symbols-outlined opacity-70 text-sm shrink-0">
                folder
              </span>
              <span>{collection.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function UserFooter() {
  return (
    <SidebarFooter className="p-3 space-y-4 mt-auto group-data-[collapsible=icon]:px-2">
      <div className="px-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <Link
          href="/documentation"
          className="flex items-center gap-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-colors rounded-md group-data-[collapsible=icon]:justify-center"
        >
          <span className="material-symbols-outlined opacity-70 shrink-0">
            description
          </span>
          <span className="group-data-[collapsible=icon]:hidden">
            Documentation
          </span>
        </Link>
      </div>
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between p-2 group-data-[collapsible=icon]:p-0 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer w-full group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-3 min-w-0 group-data-[collapsible=icon]:gap-0">
            <Avatar className="w-8 h-8 rounded-md border border-border shrink-0">
              <AvatarImage src={currentUser.image} alt={currentUser.name} />
              <AvatarFallback className="rounded-md">
                {currentUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="text-xs font-semibold truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                v2.4.0 • Pro
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-muted-foreground text-sm group-data-[collapsible=icon]:hidden">
            unfold_more
          </span>
        </div>
      </div>
    </SidebarFooter>
  );
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarLogo />
      <SidebarContent>
        <NavigationMenu />
        <FavoritesMenu />
        <RecentCollectionsMenu />
      </SidebarContent>
      <UserFooter />
    </Sidebar>
  );
}
