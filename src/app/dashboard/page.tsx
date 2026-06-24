import { MainContent } from "@/components/main/MainContent";
import { getCollectionsWithStats } from "@/lib/db/collections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevVault | Dashboard",
};

const DEMO_USER_ID = "user-1";

export default async function DashboardPage() {
  const collections = await getCollectionsWithStats(DEMO_USER_ID);
  return <MainContent collections={collections} />;
}
