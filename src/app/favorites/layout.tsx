import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SearchWrapper } from "@/components/dashboard/search-wrapper";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getItemsByTypeCount } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";
import { EditorPreferencesProvider } from "@/contexts/editor-preferences-context";

export default async function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });

  if (!user) {
    redirect("/login");
  }

  const [itemTypesByCount, collections] = await Promise.all([
    getItemsByTypeCount(session.user.id),
    getSidebarCollections(session.user.id),
  ]);

  const pathname = (await headers()).get("x-invoke-path") || "/favorites";

  return (
    <SidebarProvider>
      <AppSidebar itemTypes={itemTypesByCount} collections={collections} currentPath={pathname} isPro={user.isPro} />
      <SidebarInset>
        <SearchWrapper />
        <main className="min-h-screen">
          <div className="max-w-(--spacing-container-max) mx-auto px-8 py-10">
            <EditorPreferencesProvider>{children}</EditorPreferencesProvider>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
