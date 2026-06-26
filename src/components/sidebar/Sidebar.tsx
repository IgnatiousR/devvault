"use client";

import Link from "next/link";
import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/use-dashboard";
import type { DashboardUser, ItemTypeCount, CollectionWithStats } from "@/lib/types/dashboard";

function SidebarLogo() {
  return (
    <SidebarHeader className="h-16 px-6 group-data-[collapsible=icon]:px-2 border-b border-border flex items-center justify-center">
      <div className="flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center">
        <div className="w-6 h-6 shrink-0 bg-brand-red rounded-md flex items-center justify-center">
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

function FavoritesSection({ collections }: { collections: CollectionWithStats[] }) {
  const favorites = collections.filter((c) => c.isFavorite);

  if (favorites.length === 0) return null;

  return (
    <div className="mb-2">
      <span className="px-2 text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
        Favorites
      </span>
      <SidebarMenu>
        {favorites.map((collection) => (
          <SidebarMenuItem key={collection.id}>
            <SidebarMenuButton
              render={<Link href={`/collections/${collection.id}`} />}
              tooltip={collection.name}
              className="font-medium text-sm transition-all text-muted-foreground"
            >
              <span className="w-2 h-2 shrink-0 rounded-full bg-brand-red"></span>
              <span>{collection.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}

function RecentCollectionsSection({ collections }: { collections: CollectionWithStats[] }) {
  const recent = collections.slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <div>
      <span className="px-2 text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
        Recent
      </span>
      <SidebarMenu>
        {recent.map((collection) => (
          <SidebarMenuItem key={collection.id}>
            <SidebarMenuButton
              render={<Link href={`/collections/${collection.id}`} />}
              tooltip={collection.name}
              className="font-medium text-sm transition-all text-muted-foreground"
            >
              <span
                className="w-2 h-2 shrink-0 rounded-full"
                style={{ backgroundColor: collection.mostUsedType?.color || '#6b7280' }}
              ></span>
              <span>{collection.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link href="/collections" />}
            tooltip="View all collections"
            className="font-medium text-sm transition-all text-muted-foreground"
          >
            <span className="material-symbols-outlined opacity-70 text-sm shrink-0">
              arrow_forward
            </span>
            <span>View all collections</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}

function CollectionsMenu({ collections }: { collections: CollectionWithStats[] }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SidebarGroup>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2 group-data-[collapsible=icon]:hidden hover:text-foreground transition-colors"
      >
        <span>Collections</span>
        <span className="material-symbols-outlined text-sm">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>
      {isOpen && (
        <>
          <FavoritesSection collections={collections} />
          <RecentCollectionsSection collections={collections} />
        </>
      )}
    </SidebarGroup>
  );
}

function pluralize(name: string): string {
  const map: Record<string, string> = {
    Snippet: "Snippets",
    Prompt: "Prompts",
    Command: "Commands",
    Note: "Notes",
    File: "Files",
    Image: "Images",
    Link: "Links",
  };
  return map[name] || name;
}

function ItemTypesMenu({ itemTypes }: { itemTypes: ItemTypeCount[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
        Types
      </SidebarGroupLabel>
      <SidebarMenu>
        {itemTypes.map((itemType) => (
          <SidebarMenuItem key={itemType.name}>
            <SidebarMenuButton
              render={<Link href={`/items/${itemType.name.toLowerCase()}`} />}
              tooltip={`${pluralize(itemType.name)} (${itemType.count})`}
              className="font-medium text-sm transition-all text-muted-foreground"
            >
              <span
                className="material-symbols-outlined opacity-70 text-sm shrink-0"
                style={{ color: itemType.color }}
              >
                {itemType.icon}
              </span>
              <span>{pluralize(itemType.name)}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {itemType.count}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function SidebarSkeleton() {
  return (
    <Sidebar collapsible="icon">
      <SidebarLogo />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
            Types
          </SidebarGroupLabel>
          <SidebarMenu>
            {Array.from({ length: 7 }).map((_, i) => (
              <SidebarMenuItem key={i}>
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-6 ml-auto" />
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <div className="mx-4 h-px bg-border" />
        <SidebarGroup>
          <button className="flex items-center justify-between w-full px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
            <span>Collections</span>
          </button>
          <SidebarMenu>
            {Array.from({ length: 3 }).map((_, i) => (
              <SidebarMenuItem key={i}>
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 space-y-4 mt-auto group-data-[collapsible=icon]:px-2">
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="w-8 h-8 rounded-md" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function UserFooter({ user }: { user: DashboardUser | null }) {
  if (!user) return null;

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
              <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
              <AvatarFallback className="rounded-md">
                {user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="text-xs font-semibold truncate">
                {user.name || 'User'}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user.isPro ? 'Pro' : 'Free'}
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
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return <SidebarSkeleton />;
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarLogo />
      <SidebarContent>
        <ItemTypesMenu itemTypes={data.itemTypesByCount} />
        <div className="mx-4 h-px bg-border" />
        <CollectionsMenu collections={data.collections} />
      </SidebarContent>
      <UserFooter user={data.user} />
    </Sidebar>
  );
}
