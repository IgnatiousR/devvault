"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSessionUserId(): Promise<
  | { userId: string }
  | { success: false; error: string }
> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  return { userId: session.user.id };
}
