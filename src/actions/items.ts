"use server";

import { z } from "zod";
import { updateItem, deleteItem, createItem, toggleItemFavorite, toggleItemPin, type UpdateItemData, type ItemDetail } from "@/lib/db/items";
import { getSessionUserId } from "./shared";
import {
  validateWithFieldErrors,
  validateSimple,
  notFound,
} from "@/lib/action-utils";
import { assertWithinItemLimit } from "@/lib/usage-limits";

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
  const validation = validateWithFieldErrors(updateItemSchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  const { itemId, ...data } = validation.data;

  const result = await updateItem(itemId, auth.userId, {
    title: data.title,
    description: data.description ?? null,
    content: data.content ?? null,
    language: data.language ?? null,
    url: data.url ?? null,
    tags: data.tags,
  });

  if (!result) return notFound("Item");

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
  const validation = validateSimple(deleteItemSchema, input, "Invalid item ID");
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  const result = await deleteItem(validation.data.itemId, auth.userId);

  if (!result) return notFound("Item");

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
  const validation = validateWithFieldErrors(createItemSchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  try {
    await assertWithinItemLimit(auth.userId);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Item limit reached",
    };
  }

  const result = await createItem(auth.userId, {
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

  if (!result) return { success: false, error: "Failed to create item" };

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
  const validation = validateSimple(toggleFavoriteSchema, input, "Invalid item ID");
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  const result = await toggleItemFavorite(
    validation.data.itemId,
    auth.userId
  );

  if (result === null) return notFound("Item");

  return { success: true, isFavorite: result };
}

const togglePinSchema = z.object({
  itemId: z.string().min(1),
});

type TogglePinInput = z.infer<typeof togglePinSchema>;

interface TogglePinResult {
  success: boolean;
  isPinned?: boolean;
  error?: string;
}

export async function toggleItemPinAction(
  input: TogglePinInput
): Promise<TogglePinResult> {
  const validation = validateSimple(togglePinSchema, input, "Invalid item ID");
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  const result = await toggleItemPin(
    validation.data.itemId,
    auth.userId
  );

  if (result === null) return notFound("Item");

  return { success: true, isPinned: result };
}
