"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type SuccessResult<T = void> = { success: true } & (T extends void ? {} : { data: T });

export type ErrorResult = { success: false; error: string };

// fallow-ignore-next-line unused-type
export type ActionResult<T = void> = SuccessResult<T> | ErrorResult;

// fallow-ignore-next-line unused-type
export type ToggleResult<K extends string> =
  | { success: true } & Record<K, boolean>
  | ErrorResult;

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

export async function getSessionUser(): Promise<
  | { userId: string; email: string; name?: string; image?: string }
  | { success: false; error: string }
> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name ?? undefined,
    image: session.user.image ?? undefined,
  };
}
