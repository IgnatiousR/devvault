"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { UserMenu } from "@/components/auth/user-menu";
import { getColorTextClass } from "@/lib/color-utils";
import type { SidebarCollection } from "@/lib/db/collections";
import type { ItemTypeCount } from "@/lib/db/items";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const PRO_GATED_TYPES = ["File", "Image"];

function SidebarLogo() {
  return (
    <SidebarHeader className="h-16 px-6 group-data-[collapsible=icon]:px-2 border-b border-border flex items-center justify-center">
      <div className="flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center">
        <div className="w-6 h-6 shrink-0 bg-gradient-to-br from-red-500 to-red-600 rounded-md flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
            <path d="M3 7l9 4 9-4M12 11v10" />
          </svg>
        </div>
        <span className="font-semibold text-sm tracking-tight group-data-[collapsible=icon]:hidden">
          DevVault
        </span>
      </div>
    </SidebarHeader>
  );
}

function FavoritesSection({ collections }: { collections: SidebarCollection[] }) {
  const favorites = collections.filter((c) => c.isFavorite);

  if (favorites.length === 0) return null;

  return (
    <div className="mb-2">
      <span className="px-2 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
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

function RecentCollectionsSection({ collections }: { collections: SidebarCollection[] }) {
  const recent = collections.slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <div>
      <span className="px-2 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
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
                className={`w-2 h-2 shrink-0 rounded-full ${getColorTextClass(collection.mostUsedType?.color)}`}
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

function CollectionsMenu({ collections }: { collections: SidebarCollection[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
        Collections
      </SidebarGroupLabel>
      <FavoritesSection collections={collections} />
      <RecentCollectionsSection collections={collections} />
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

function ItemTypesMenu({
  itemTypes,
  isPro,
}: {
  itemTypes: ItemTypeCount[];
  isPro: boolean;
}) {
  const router = useRouter();
  const [proDialogOpen, setProDialogOpen] = useState(false);
  const [selectedProType, setSelectedProType] = useState<string | null>(null);

  const handleProClick = (typeName: string) => {
    setSelectedProType(typeName);
    setProDialogOpen(true);
  };

  const handleUpgrade = () => {
    setProDialogOpen(false);
    router.push("/settings/billing");
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
        Types
      </SidebarGroupLabel>
      <SidebarMenu>
        {itemTypes.map((itemType) => {
          const isProGated = PRO_GATED_TYPES.includes(itemType.name);

          if (isProGated && !isPro) {
            return (
              <SidebarMenuItem key={itemType.name}>
                <SidebarMenuButton
                  onClick={() => handleProClick(itemType.name)}
                  tooltip={`${pluralize(itemType.name)} (${itemType.count}) — Pro feature`}
                  className="font-medium text-sm transition-all text-muted-foreground"
                >
                  <span
                    className={`material-symbols-outlined opacity-70 text-sm shrink-0 ${getColorTextClass(itemType.color)}`}
                  >
                    {itemType.icon}
                  </span>
                  <span>{pluralize(itemType.name)}</span>
                  <Badge variant="pro" className="ml-auto mr-1">
                    Pro
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <SidebarMenuItem key={itemType.name}>
              <SidebarMenuButton
                render={<Link href={`/items/${itemType.name.toLowerCase()}`} />}
                tooltip={`${pluralize(itemType.name)} (${itemType.count})`}
                className="font-medium text-sm transition-all text-muted-foreground"
              >
                <span
                  className={`material-symbols-outlined opacity-70 text-sm shrink-0 ${getColorTextClass(itemType.color)}`}
                >
                  {itemType.icon}
                </span>
                <span>{pluralize(itemType.name)}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {itemType.count}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>

      <AlertDialog open={proDialogOpen} onOpenChange={setProDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pro Feature</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProType &&
                `${pluralize(selectedProType)} are a Pro feature. Upgrade to access file uploads and image storage.`}
              <span className="block mt-2 text-foreground font-medium">
                $8/month or $72/year (Save 25%)
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white"
              onClick={handleUpgrade}
            >
              Upgrade to Pro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarGroup>
  );
}

function UserFooter() {
  return (
    <SidebarFooter className="p-3 space-y-4 mt-auto group-data-[collapsible=icon]:px-2">
      <div className="border-t border-border pt-4">
        <UserMenu showUserInfo={true} />
      </div>
    </SidebarFooter>
  );
}

interface AppSidebarProps {
  itemTypes: ItemTypeCount[];
  collections: SidebarCollection[];
  currentPath?: string;
  isPro?: boolean;
}

export function AppSidebar({ itemTypes, collections, currentPath, isPro = false }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarLogo />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/dashboard" />}
                tooltip="Dashboard"
                className="font-medium text-sm transition-all text-muted-foreground"
                aria-current={currentPath === "/dashboard" ? "page" : undefined}
              >
                <span className="material-symbols-outlined opacity-70 text-sm shrink-0">
                  dashboard
                </span>
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <div className="mx-4 h-px bg-border" />
        <ItemTypesMenu itemTypes={itemTypes} isPro={isPro} />
        <div className="mx-4 h-px bg-border" />
        <CollectionsMenu collections={collections} />
      </SidebarContent>
      <UserFooter />
    </Sidebar>
  );
}
