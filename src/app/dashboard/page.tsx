import { MainContent } from "@/components/main/MainContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevVault | Dashboard",
};

export default function DashboardPage() {
  return <MainContent />;
}
