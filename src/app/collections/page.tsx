import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCollectionsWithStats } from "@/lib/db/collections";
import { CollectionsListContent } from "@/components/collections/collections-list-content";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevVault | Collections",
};

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;

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

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const { collections, totalCount } = await getCollectionsWithStats(user.id, {
    page,
    limit: COLLECTIONS_PER_PAGE,
  });

  const totalPages = Math.ceil(totalCount / COLLECTIONS_PER_PAGE);

  return (
    <CollectionsListContent
      collections={collections}
      currentPage={page}
      totalPages={totalPages}
    />
  );
}
