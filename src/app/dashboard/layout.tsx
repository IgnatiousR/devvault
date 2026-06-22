import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/sidebar/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="pl-sidebar-width pt-16 min-h-screen">
          <div className="max-w-container-max mx-auto px-8 py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
