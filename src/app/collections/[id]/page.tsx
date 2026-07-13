import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCollectionById, getItemsByCollectionId } from "@/lib/db/collections";
import { CollectionDetailContent } from "@/components/collections/collection-detail-content";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
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

export default async function CollectionDetailPage({ params }: PageProps) {
  const { id } = await params;

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

  const [collection, dbItems] = await Promise.all([
    getCollectionById(id, user.id),
    getItemsByCollectionId(id, user.id),
  ]);

  if (!collection || !dbItems) {
    notFound();
  }

  const items = dbItems.map((item) => ({
    ...item,
    updatedAt: item.updatedAt.toISOString(),
  }));

  return <CollectionDetailContent collection={collection} items={items} />;
}
