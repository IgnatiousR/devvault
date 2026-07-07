import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/db/items", () => ({
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}));

import { updateItemAction, deleteItemAction } from "./items";
import { auth } from "@/lib/auth";
import { updateItem, deleteItem } from "@/lib/db/items";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockUpdateItem = vi.mocked(updateItem);
const mockDeleteItem = vi.mocked(deleteItem);

describe("updateItemAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" },
    } as never);
  });

  it("returns error when title is empty", async () => {
    const result = await updateItemAction({
      itemId: "item-1",
      title: "",
      tags: ["tag1"],
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Validation failed");
    expect(result.fieldErrors?.title).toBe("Title is required");
  });

  it("returns error when title is only whitespace", async () => {
    const result = await updateItemAction({
      itemId: "item-1",
      title: "   ",
      tags: [],
    });

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.title).toBe("Title is required");
  });

  it("returns error when itemId is empty", async () => {
    const result = await updateItemAction({
      itemId: "",
      title: "Test",
      tags: [],
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Validation failed");
  });

  it("returns error for invalid URL", async () => {
    const result = await updateItemAction({
      itemId: "item-1",
      title: "Test",
      url: "not-a-url",
      tags: [],
    });

    expect(result.success).false;
    expect(result.fieldErrors?.url).toBe("Invalid URL format");
  });

  it("returns error when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await updateItemAction({
      itemId: "item-1",
      title: "Test",
      tags: [],
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("returns error when item not found", async () => {
    mockUpdateItem.mockResolvedValue(null);

    const result = await updateItemAction({
      itemId: "nonexistent",
      title: "Test",
      tags: [],
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Item not found");
  });

  it("returns success with updated item data", async () => {
    mockUpdateItem.mockResolvedValue({
      id: "item-1",
      title: "Updated Title",
      description: "desc",
      content: "code",
      language: "ts",
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      isPinned: false,
      isFavorite: false,
      itemType: { name: "Snippet", icon: "code", color: "#ef4444" },
      tags: ["tag1"],
      collections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await updateItemAction({
      itemId: "item-1",
      title: "Updated Title",
      description: "desc",
      content: "code",
      language: "ts",
      tags: ["tag1"],
    });

    expect(result.success).toBe(true);
    expect(result.data?.title).toBe("Updated Title");
    expect(mockUpdateItem).toHaveBeenCalledWith("item-1", "user-1", {
      title: "Updated Title",
      description: "desc",
      content: "code",
      language: "ts",
      url: null,
      tags: ["tag1"],
    });
  });

  it("accepts valid URL", async () => {
    mockUpdateItem.mockResolvedValue({
      id: "item-1",
      title: "Link",
      description: null,
      content: null,
      language: null,
      url: "https://example.com",
      fileUrl: null,
      fileName: null,
      fileSize: null,
      isPinned: false,
      isFavorite: false,
      itemType: { name: "Link", icon: "link", color: "#10b981" },
      tags: [],
      collections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await updateItemAction({
      itemId: "item-1",
      title: "Link",
      url: "https://example.com",
      tags: [],
    });

    expect(result.success).toBe(true);
    expect(mockUpdateItem).toHaveBeenCalledWith("item-1", "user-1", expect.objectContaining({ url: "https://example.com" }));
  });
});

describe("deleteItemAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" },
    } as never);
  });

  it("returns error when itemId is empty", async () => {
    const result = await deleteItemAction({ itemId: "" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid item ID");
  });

  it("returns error when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await deleteItemAction({ itemId: "item-1" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("returns error when item not found", async () => {
    mockDeleteItem.mockResolvedValue(false);

    const result = await deleteItemAction({ itemId: "nonexistent" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Item not found");
  });

  it("returns success when item is deleted", async () => {
    mockDeleteItem.mockResolvedValue(true);

    const result = await deleteItemAction({ itemId: "item-1" });

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(mockDeleteItem).toHaveBeenCalledWith("item-1", "user-1");
  });
});
