"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createCollection, type CreatedCollection } from "@/lib/db/collections";

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().nullable().optional(),
});

type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

interface CreateCollectionResult {
  success: boolean;
  data?: CreatedCollection;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createCollectionAction(
  input: CreateCollectionInput
): Promise<CreateCollectionResult> {
  const validation = createCollectionSchema.safeParse(input);

  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      fieldErrors[field] = issue.message;
    });
    return {
      success: false,
      error: "Validation failed",
      fieldErrors,
    };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await createCollection(session.user.id, {
    name: validation.data.name,
    description: validation.data.description ?? null,
  });

  if (!result) {
    return { success: false, error: "Failed to create collection" };
  }

  revalidatePath("/dashboard");

  return { success: true, data: result };
}
