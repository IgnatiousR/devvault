import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getItemsByType } from "@/lib/db/items";
import { ItemsListContent } from "@/components/items/items-list-content";
import type { Metadata } from "next";

const VALID_TYPES = ["snippet", "prompt", "command", "note", "link", "file", "image"];

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const typeName = VALID_TYPES.includes(type) ? type : "items";
  return { title: `DevVault | ${typeName.charAt(0).toUpperCase() + typeName.slice(1)}` };
}

export default async function ItemsPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const dbItems = await getItemsByType(session.user.id, type);
  const items = dbItems.map((item) => ({
    ...item,
    updatedAt: item.updatedAt.toISOString(),
  }));

  return <ItemsListContent typeName={type} items={items} />;
}
