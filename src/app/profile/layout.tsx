import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SearchWrapper } from "@/components/dashboard/search-wrapper";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getItemsByTypeCount } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";

export default async function ProfileLayout({
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

  const [itemTypesByCount, collections] = await Promise.all([
    getItemsByTypeCount(session.user.id),
    getSidebarCollections(session.user.id),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar itemTypes={itemTypesByCount} collections={collections} />
      <SidebarInset>
        <SearchWrapper />
        <main className="min-h-screen">
          <div className="max-w-(--spacing-container-max) mx-auto px-8 py-10">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
