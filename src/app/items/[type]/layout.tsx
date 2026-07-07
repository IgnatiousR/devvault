import { TopBar } from "@/components/dashboard/top-bar";
import { AppSidebar } from "@/components/sidebar/Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
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
