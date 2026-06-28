import { MainContent } from "@/components/main/main-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevVault | Dashboard",
};

export default function DashboardPage() {
  return <MainContent />;
}
