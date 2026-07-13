"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  createCollection,
  setItemCollections,
  updateCollection,
  deleteCollection,
  toggleCollectionFavorite,
  type CreatedCollection,
} from "@/lib/db/collections";

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

const updateItemCollectionsSchema = z.object({
  itemId: z.string().min(1),
  collectionIds: z.array(z.string()),
});

type UpdateItemCollectionsInput = z.infer<typeof updateItemCollectionsSchema>;

interface UpdateItemCollectionsResult {
  success: boolean;
  error?: string;
}

export async function updateItemCollectionsAction(
  input: UpdateItemCollectionsInput
): Promise<UpdateItemCollectionsResult> {
  const validation = updateItemCollectionsSchema.safeParse(input);

  if (!validation.success) {
    return { success: false, error: "Invalid input" };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await setItemCollections(
    validation.data.itemId,
    session.user.id,
    validation.data.collectionIds
  );

  if (!result) {
    return { success: false, error: "Item not found" };
  }

  revalidatePath("/dashboard");

  return { success: true };
}

const updateCollectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").optional(),
  description: z.string().nullable().optional(),
});

type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;

interface UpdateCollectionResult {
  success: boolean;
  error?: string;
}

export async function updateCollectionAction(
  input: UpdateCollectionInput
): Promise<UpdateCollectionResult> {
  const validation = updateCollectionSchema.safeParse(input);

  if (!validation.success) {
    return { success: false, error: "Invalid input" };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await updateCollection(
    validation.data.id,
    session.user.id,
    {
      name: validation.data.name,
      description: validation.data.description,
    }
  );

  if (!result) {
    return { success: false, error: "Collection not found" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/collections");
  revalidatePath(`/collections/${validation.data.id}`);

  return { success: true };
}

const deleteCollectionSchema = z.object({
  id: z.string().min(1),
});

type DeleteCollectionInput = z.infer<typeof deleteCollectionSchema>;

interface DeleteCollectionResult {
  success: boolean;
  error?: string;
}

export async function deleteCollectionAction(
  input: DeleteCollectionInput
): Promise<DeleteCollectionResult> {
  const validation = deleteCollectionSchema.safeParse(input);

  if (!validation.success) {
    return { success: false, error: "Invalid input" };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await deleteCollection(
    validation.data.id,
    session.user.id
  );

  if (!result) {
    return { success: false, error: "Collection not found" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/collections");

  return { success: true };
}

const toggleFavoriteSchema = z.object({
  id: z.string().min(1),
});

type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;

interface ToggleFavoriteResult {
  success: boolean;
  isFavorite?: boolean;
  error?: string;
}

export async function toggleCollectionFavoriteAction(
  input: ToggleFavoriteInput
): Promise<ToggleFavoriteResult> {
  const validation = toggleFavoriteSchema.safeParse(input);

  if (!validation.success) {
    return { success: false, error: "Invalid input" };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await toggleCollectionFavorite(
    validation.data.id,
    session.user.id
  );

  if (result === null) {
    return { success: false, error: "Collection not found" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/collections");
  revalidatePath(`/collections/${validation.data.id}`);

  return { success: true, isFavorite: result };
}
