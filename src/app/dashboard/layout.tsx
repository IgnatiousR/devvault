import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <TopBar />
        <main className="min-h-screen">
          <div className="max-w-[var(--spacing-container-max)] mx-auto px-8 py-10">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
