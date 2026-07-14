"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { updateItem, deleteItem, createItem, toggleItemFavorite, type UpdateItemData, type ItemDetail } from "@/lib/db/items";

const updateItemSchema = z.object({
  itemId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  url: z.string().url("Invalid URL format").nullable().optional(),
  tags: z.array(z.string().trim().min(1)),
});

type UpdateItemInput = z.infer<typeof updateItemSchema>;

interface UpdateItemResult {
  success: boolean;
  data?: UpdateItemData;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function updateItemAction(
  input: UpdateItemInput
): Promise<UpdateItemResult> {
  const validation = updateItemSchema.safeParse(input);

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

  const { itemId, ...data } = validation.data;

  const result = await updateItem(itemId, session.user.id, {
    title: data.title,
    description: data.description ?? null,
    content: data.content ?? null,
    language: data.language ?? null,
    url: data.url ?? null,
    tags: data.tags,
  });

  if (!result) {
    return { success: false, error: "Item not found" };
  }

  return {
    success: true,
    data: {
      title: result.title,
      description: result.description,
      content: result.content,
      language: result.language,
      url: result.url,
      tags: result.tags,
    },
  };
}

const deleteItemSchema = z.object({
  itemId: z.string().min(1),
});

type DeleteItemInput = z.infer<typeof deleteItemSchema>;

interface DeleteItemResult {
  success: boolean;
  error?: string;
}

export async function deleteItemAction(
  input: DeleteItemInput
): Promise<DeleteItemResult> {
  const validation = deleteItemSchema.safeParse(input);

  if (!validation.success) {
    return { success: false, error: "Invalid item ID" };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await deleteItem(validation.data.itemId, session.user.id);

  if (!result) {
    return { success: false, error: "Item not found" };
  }

  return { success: true };
}

const createItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  url: z.string().url("Invalid URL format").nullable().optional(),
  fileUrl: z.string().url("Invalid URL format").nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
  tags: z.array(z.string().trim().min(1)),
  itemTypeId: z.string().min(1, "Item type is required"),
  collectionIds: z.array(z.string()).optional(),
});

type CreateItemInput = z.infer<typeof createItemSchema>;

interface CreateItemResult {
  success: boolean;
  data?: ItemDetail;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createItemAction(
  input: CreateItemInput
): Promise<CreateItemResult> {
  const validation = createItemSchema.safeParse(input);

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

  const result = await createItem(session.user.id, {
    title: validation.data.title,
    description: validation.data.description ?? null,
    content: validation.data.content ?? null,
    language: validation.data.language ?? null,
    url: validation.data.url ?? null,
    fileUrl: validation.data.fileUrl ?? null,
    fileName: validation.data.fileName ?? null,
    fileSize: validation.data.fileSize ?? null,
    tags: validation.data.tags,
    itemTypeId: validation.data.itemTypeId,
    collectionIds: validation.data.collectionIds ?? [],
  });

  if (!result) {
    return { success: false, error: "Failed to create item" };
  }

  return { success: true, data: result };
}

const toggleFavoriteSchema = z.object({
  itemId: z.string().min(1),
});

type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;

interface ToggleFavoriteResult {
  success: boolean;
  isFavorite?: boolean;
  error?: string;
}

export async function toggleItemFavoriteAction(
  input: ToggleFavoriteInput
): Promise<ToggleFavoriteResult> {
  const validation = toggleFavoriteSchema.safeParse(input);

  if (!validation.success) {
    return { success: false, error: "Invalid item ID" };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await toggleItemFavorite(
    validation.data.itemId,
    session.user.id
  );

  if (result === null) {
    return { success: false, error: "Item not found" };
  }

  return { success: true, isFavorite: result };
}
