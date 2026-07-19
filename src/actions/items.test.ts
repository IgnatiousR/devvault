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
  createItem: vi.fn(),
}));

vi.mock("@/lib/usage-limits", () => ({
  assertWithinItemLimit: vi.fn(),
}));

import { updateItemAction, deleteItemAction, createItemAction } from "./items";
import { auth } from "@/lib/auth";
import { updateItem, deleteItem, createItem } from "@/lib/db/items";
import { assertWithinItemLimit } from "@/lib/usage-limits";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockUpdateItem = vi.mocked(updateItem);
const mockDeleteItem = vi.mocked(deleteItem);
const mockCreateItem = vi.mocked(createItem);
const mockAssertWithinItemLimit = vi.mocked(assertWithinItemLimit);

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

describe("createItemAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" },
    } as never);
    mockAssertWithinItemLimit.mockResolvedValue(undefined);
  });

  it("returns error when title is empty", async () => {
    const result = await createItemAction({
      title: "",
      tags: [],
      itemTypeId: "snippet",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Validation failed");
    expect(result.fieldErrors?.title).toBe("Title is required");
  });

  it("returns error when itemTypeId is empty", async () => {
    const result = await createItemAction({
      title: "Test",
      tags: [],
      itemTypeId: "",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Validation failed");
    expect(result.fieldErrors?.itemTypeId).toBe("Item type is required");
  });

  it("returns error when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await createItemAction({
      title: "Test",
      tags: [],
      itemTypeId: "snippet",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("returns error for invalid fileUrl", async () => {
    const result = await createItemAction({
      title: "Test",
      tags: [],
      itemTypeId: "file",
      fileUrl: "not-a-url",
      fileName: "test.pdf",
      fileSize: 1024,
    });

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.fileUrl).toBe("Invalid URL format");
  });

  it("returns error for invalid url field", async () => {
    const result = await createItemAction({
      title: "Test",
      tags: [],
      itemTypeId: "link",
      url: "not-a-url",
    });

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.url).toBe("Invalid URL format");
  });

  it("creates item with file fields", async () => {
    mockCreateItem.mockResolvedValue({
      id: "item-1",
      title: "My Image",
      description: null,
      content: null,
      language: null,
      url: null,
      fileUrl: "https://bucket.s3.filebase.io/uploads/user-1/123-image.png",
      fileName: "image.png",
      fileSize: 1024000,
      isPinned: false,
      isFavorite: false,
      itemType: { name: "Image", icon: "image", color: "#a855f7" },
      tags: [],
      collections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createItemAction({
      title: "My Image",
      tags: [],
      itemTypeId: "image",
      fileUrl: "https://bucket.s3.filebase.io/uploads/user-1/123-image.png",
      fileName: "image.png",
      fileSize: 1024000,
    });

    expect(result.success).toBe(true);
    expect(result.data?.fileUrl).toBe("https://bucket.s3.filebase.io/uploads/user-1/123-image.png");
    expect(result.data?.fileName).toBe("image.png");
    expect(result.data?.fileSize).toBe(1024000);
    expect(mockCreateItem).toHaveBeenCalledWith("user-1", expect.objectContaining({
      fileUrl: "https://bucket.s3.filebase.io/uploads/user-1/123-image.png",
      fileName: "image.png",
      fileSize: 1024000,
    }));
  });

  it("creates item without file fields", async () => {
    mockCreateItem.mockResolvedValue({
      id: "item-2",
      title: "My Snippet",
      description: null,
      content: "console.log('hello')",
      language: "javascript",
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      isPinned: false,
      isFavorite: false,
      itemType: { name: "Snippet", icon: "code", color: "#ef4444" },
      tags: ["js"],
      collections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createItemAction({
      title: "My Snippet",
      content: "console.log('hello')",
      language: "javascript",
      tags: ["js"],
      itemTypeId: "snippet",
    });

    expect(result.success).toBe(true);
    expect(result.data?.fileUrl).toBeNull();
    expect(result.data?.fileName).toBeNull();
    expect(result.data?.fileSize).toBeNull();
    expect(mockCreateItem).toHaveBeenCalledWith("user-1", expect.objectContaining({
      fileUrl: null,
      fileName: null,
      fileSize: null,
    }));
  });

  it("accepts valid fileUrl", async () => {
    mockCreateItem.mockResolvedValue({
      id: "item-3",
      title: "Document",
      description: null,
      content: null,
      language: null,
      url: null,
      fileUrl: "https://bucket.s3.filebase.io/uploads/user-1/doc.pdf",
      fileName: "doc.pdf",
      fileSize: 50000,
      isPinned: false,
      isFavorite: false,
      itemType: { name: "File", icon: "description", color: "#3b82f6" },
      tags: [],
      collections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createItemAction({
      title: "Document",
      tags: [],
      itemTypeId: "file",
      fileUrl: "https://bucket.s3.filebase.io/uploads/user-1/doc.pdf",
      fileName: "doc.pdf",
      fileSize: 50000,
    });

    expect(result.success).toBe(true);
    expect(mockCreateItem).toHaveBeenCalledWith("user-1", expect.objectContaining({
      fileUrl: "https://bucket.s3.filebase.io/uploads/user-1/doc.pdf",
    }));
  });
});
