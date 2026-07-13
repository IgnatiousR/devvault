import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAllSearchItems } from "@/lib/db/items";
import { getAllSearchCollections } from "@/lib/db/collections";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [items, collections] = await Promise.all([
    getAllSearchItems(session.user.id),
    getAllSearchCollections(session.user.id),
  ]);

  return NextResponse.json({ items, collections });
}
