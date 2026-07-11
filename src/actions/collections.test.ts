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

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
}));

import { createCollectionAction } from "./collections";
import { auth } from "@/lib/auth";
import { createCollection } from "@/lib/db/collections";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockCreateCollection = vi.mocked(createCollection);

describe("createCollectionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" },
    } as never);
  });

  it("returns error when name is empty", async () => {
    const result = await createCollectionAction({
      name: "",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Validation failed");
    expect(result.fieldErrors?.name).toBe("Name is required");
  });

  it("returns error when name is only whitespace", async () => {
    const result = await createCollectionAction({
      name: "   ",
    });

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.name).toBe("Name is required");
  });

  it("returns error when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await createCollectionAction({
      name: "My Collection",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("returns error when createCollection fails", async () => {
    mockCreateCollection.mockResolvedValue(null);

    const result = await createCollectionAction({
      name: "My Collection",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to create collection");
  });

  it("returns success with created collection", async () => {
    mockCreateCollection.mockResolvedValue({
      id: "col-1",
      name: "My Collection",
      description: "A test collection",
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createCollectionAction({
      name: "My Collection",
      description: "A test collection",
    });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("My Collection");
    expect(result.data?.description).toBe("A test collection");
    expect(mockCreateCollection).toHaveBeenCalledWith("user-1", {
      name: "My Collection",
      description: "A test collection",
    });
  });

  it("creates collection without description", async () => {
    mockCreateCollection.mockResolvedValue({
      id: "col-2",
      name: "No Desc",
      description: null,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createCollectionAction({
      name: "No Desc",
    });

    expect(result.success).toBe(true);
    expect(mockCreateCollection).toHaveBeenCalledWith("user-1", {
      name: "No Desc",
      description: null,
    });
  });

  it("trims whitespace from name", async () => {
    mockCreateCollection.mockResolvedValue({
      id: "col-3",
      name: "Trimmed Name",
      description: null,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createCollectionAction({
      name: "  Trimmed Name  ",
    });

    expect(result.success).toBe(true);
    expect(mockCreateCollection).toHaveBeenCalledWith("user-1", {
      name: "Trimmed Name",
      description: null,
    });
  });

  it("passes empty description as empty string", async () => {
    mockCreateCollection.mockResolvedValue({
      id: "col-4",
      name: "Test",
      description: null,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createCollectionAction({
      name: "Test",
      description: "",
    });

    expect(result.success).toBe(true);
    expect(mockCreateCollection).toHaveBeenCalledWith("user-1", {
      name: "Test",
      description: "",
    });
  });
});
