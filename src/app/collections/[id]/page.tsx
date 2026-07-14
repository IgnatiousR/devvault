import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCollectionById, getItemsByCollectionId } from "@/lib/db/collections";
import { CollectionDetailContent } from "@/components/collections/collection-detail-content";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { title: "DevVault | Collection" };
  }

  const collection = await getCollectionById(id, session.user.id);
  return { title: `DevVault | ${collection?.name ?? "Collection"}` };
}

export default async function CollectionDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
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

  const [collection, result] = await Promise.all([
    getCollectionById(id, user.id),
    getItemsByCollectionId(id, user.id, {
      page,
      limit: ITEMS_PER_PAGE,
    }),
  ]);

  if (!collection || !result) {
    notFound();
  }

  const items = result.items.map((item) => ({
    ...item,
    updatedAt: item.updatedAt.toISOString(),
  }));

  const totalPages = Math.ceil(result.totalCount / ITEMS_PER_PAGE);

  return (
    <CollectionDetailContent
      collection={collection}
      items={items}
      currentPage={page}
      totalPages={totalPages}
    />
  );
}
