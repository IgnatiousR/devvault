import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getItemsByType } from "@/lib/db/items";
import { ItemsListContent } from "@/components/items/items-list-content";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { Metadata } from "next";

const VALID_TYPES = ["snippet", "prompt", "command", "note", "link", "file", "image"];

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const typeName = VALID_TYPES.includes(type) ? type : "items";
  return { title: `DevVault | ${typeName.charAt(0).toUpperCase() + typeName.slice(1)}` };
}

export default async function ItemsPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { type } = await params;
  const { page: pageParam } = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const { items: dbItems, totalCount } = await getItemsByType(session.user.id, type, {
    page,
    limit: ITEMS_PER_PAGE,
  });

  const items = dbItems.map((item) => ({
    ...item,
    updatedAt: item.updatedAt.toISOString(),
  }));

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <ItemsListContent
      typeName={type}
      items={items}
      currentPage={page}
      totalPages={totalPages}
    />
  );
}
