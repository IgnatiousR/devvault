import { TopBar } from "@/components/dashboard/TopBar";
import { AppSidebar } from "@/components/sidebar/Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { prisma } from "@/lib/prisma";
import { getCollectionsWithStats } from "@/lib/db/collections";
import { getItemsByTypeCount } from "@/lib/db/items";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await prisma.user.findFirst({
    where: { email: "demo@devvault.io" },
  });

  if (!user) {
    return (
      <SidebarProvider>
        <AppSidebar user={null} collections={[]} itemTypes={[]} />
        <SidebarInset>
          <TopBar />
          <main className="min-h-screen">
            <div className="max-w-(--spacing-container-max) mx-auto px-8 py-10">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const [collections, itemTypes] = await Promise.all([
    getCollectionsWithStats(user.id),
    getItemsByTypeCount(user.id),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar user={user} collections={collections} itemTypes={itemTypes} />
      <SidebarInset>
        <TopBar />
        <main className="min-h-screen">
          <div className="max-w-(--spacing-container-max) mx-auto px-8 py-10">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
