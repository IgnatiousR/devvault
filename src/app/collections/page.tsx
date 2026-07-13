import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCollectionsWithStats } from "@/lib/db/collections";
import { CollectionsListContent } from "@/components/collections/collections-list-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevVault | Collections",
};

export default async function CollectionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  const collections = await getCollectionsWithStats(user.id);

  return <CollectionsListContent collections={collections} />;
}
