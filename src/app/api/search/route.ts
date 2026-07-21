import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-utils";
import { getAllSearchItems } from "@/lib/db/items";
import { getAllSearchCollections } from "@/lib/db/collections";

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [items, collections] = await Promise.all([
      getAllSearchItems(user.id),
      getAllSearchCollections(user.id),
    ]);

    return NextResponse.json({ items, collections });
  } catch (error) {
    console.error("Error fetching search data:", error);
    return NextResponse.json(
      { error: "Failed to fetch search data" },
      { status: 500 }
    );
  }
}
