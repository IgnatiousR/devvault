"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createCollection,
  setItemCollections,
  updateCollection,
  deleteCollection,
  toggleCollectionFavorite,
  type CreatedCollection,
} from "@/lib/db/collections";
import { getSessionUserId } from "./shared";
import {
  validateWithFieldErrors,
  validateSimple,
  notFound,
} from "@/lib/action-utils";
import { assertWithinCollectionLimit } from "@/lib/usage-limits";
import { idOnlySchema } from "@/lib/schemas";

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
  const validation = validateWithFieldErrors(createCollectionSchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  try {
    await assertWithinCollectionLimit(auth.userId);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Collection limit reached",
    };
  }

  const result = await createCollection(auth.userId, {
    name: validation.data.name,
    description: validation.data.description ?? null,
  });

  if (!result) return { success: false, error: "Failed to create collection" };

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
  const validation = validateSimple(updateItemCollectionsSchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  const result = await setItemCollections(
    validation.data.itemId,
    auth.userId,
    validation.data.collectionIds
  );

  if (!result) return notFound("Item");

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
  const validation = validateSimple(updateCollectionSchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  const result = await updateCollection(
    validation.data.id,
    auth.userId,
    {
      name: validation.data.name,
      description: validation.data.description,
    }
  );

  if (!result) return notFound("Collection");

  revalidatePath("/dashboard");
  revalidatePath("/collections");
  revalidatePath(`/collections/${validation.data.id}`);

  return { success: true };
}

type DeleteCollectionInput = z.infer<typeof idOnlySchema>;

interface DeleteCollectionResult {
  success: boolean;
  error?: string;
}

export async function deleteCollectionAction(
  input: DeleteCollectionInput
): Promise<DeleteCollectionResult> {
  const validation = validateSimple(idOnlySchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  const result = await deleteCollection(validation.data.id, auth.userId);

  if (!result) return notFound("Collection");

  revalidatePath("/dashboard");
  revalidatePath("/collections");

  return { success: true };
}

type ToggleFavoriteInput = z.infer<typeof idOnlySchema>;

interface ToggleFavoriteResult {
  success: boolean;
  isFavorite?: boolean;
  error?: string;
}

export async function toggleCollectionFavoriteAction(
  input: ToggleFavoriteInput
): Promise<ToggleFavoriteResult> {
  const validation = validateSimple(idOnlySchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  const result = await toggleCollectionFavorite(
    validation.data.id,
    auth.userId
  );

  if (result === null) return notFound("Collection");

  revalidatePath("/dashboard");
  revalidatePath("/collections");
  revalidatePath(`/collections/${validation.data.id}`);

  return { success: true, isFavorite: result };
}
