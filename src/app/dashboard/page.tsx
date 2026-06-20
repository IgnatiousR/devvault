import { Header } from "@/components/header/Header";
import { MainContent } from "@/components/main/MainContent";
import { Sidebar } from "@/components/sidebar/Sidebar";

export const metadata = {
  title: "DevVault | Dashboard",
};

export default function DashboardPage() {
  return (
    <>
      <Sidebar />
      <Header />
      <MainContent />
    </>
  );
}
