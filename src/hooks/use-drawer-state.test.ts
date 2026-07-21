import { describe, it, expect } from "vitest";
import { buildEditDataFromItem, buildItemEditPayload } from "@/lib/item-edit-utils";
import type { ItemDetail } from "@/types/dashboard";

function makeItem(overrides: Partial<ItemDetail> = {}): ItemDetail {
  return {
    id: "item-1",
    title: "Test Item",
    description: "A description",
    content: "some content",
    language: "javascript",
    url: null,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    isPinned: false,
    isFavorite: false,
    itemType: { name: "Snippet", icon: "code", color: "red" },
    tags: ["js", "test"],
    updatedAt: "2024-01-01T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    collectionName: null,
    collections: [{ id: "c1", name: "Dev" }],
    ...overrides,
  };
}

describe("buildEditDataFromItem", () => {
  it("maps all fields from item to EditData", () => {
    const item = makeItem();
    const result = buildEditDataFromItem(item);

    expect(result).toEqual({
      title: "Test Item",
      description: "A description",
      content: "some content",
      language: "javascript",
      url: "",
      tags: "js, test",
      collections: ["c1"],
    });
  });

  it("coerces null fields to empty strings", () => {
    const item = makeItem({ description: null, content: null, language: null });
    const result = buildEditDataFromItem(item);

    expect(result.description).toBe("");
    expect(result.content).toBe("");
    expect(result.language).toBe("");
  });

  it("joins tags with comma separator", () => {
    const item = makeItem({ tags: ["alpha", "beta", "gamma"] });
    const result = buildEditDataFromItem(item);

    expect(result.tags).toBe("alpha, beta, gamma");
  });

  it("extracts collection IDs", () => {
    const item = makeItem({
      collections: [
        { id: "c1", name: "Dev" },
        { id: "c2", name: "Work" },
      ],
    });
    const result = buildEditDataFromItem(item);

    expect(result.collections).toEqual(["c1", "c2"]);
  });
});

describe("buildItemEditPayload", () => {
  it("builds payload for snippet type with content and language", () => {
    const item = makeItem();
    const editData = buildEditDataFromItem(item);

    const payload = buildItemEditPayload(item, editData);

    expect(payload).toEqual({
      itemId: "item-1",
      title: "Test Item",
      description: "A description",
      content: "some content",
      language: "javascript",
      url: undefined,
      tags: ["js", "test"],
    });
  });

  it("builds payload for link type with url", () => {
    const item = makeItem({
      itemType: { name: "Link", icon: "link", color: "green" },
    });
    const editData = buildEditDataFromItem(item);

    const payload = buildItemEditPayload(item, {
      ...editData,
      url: "https://example.com",
    });

    expect(payload).toEqual({
      itemId: "item-1",
      title: "Test Item",
      description: "A description",
      content: undefined,
      language: undefined,
      url: "https://example.com",
      tags: ["js", "test"],
    });
  });

  it("builds payload for note type with content but no language", () => {
    const item = makeItem({
      itemType: { name: "Note", icon: "note", color: "yellow" },
      language: null,
    });
    const editData = buildEditDataFromItem(item);

    const payload = buildItemEditPayload(item, editData);

    expect(payload.content).toBe("some content");
    expect(payload.language).toBeUndefined();
  });

  it("sets optional fields to null when editData values are empty", () => {
    const item = makeItem();
    const editData = buildEditDataFromItem({
      ...item,
      description: null,
      content: null,
      language: null,
    });

    const payload = buildItemEditPayload(
      makeItem({ description: null, content: null, language: null }),
      editData
    );

    expect(payload.description).toBeNull();
    expect(payload.content).toBeNull();
    expect(payload.language).toBeNull();
  });

  it("parses tags string into array", () => {
    const item = makeItem();
    const editData = buildEditDataFromItem({ ...item, tags: ["a", "b"] });

    const payload = buildItemEditPayload(item, editData);

    expect(payload.tags).toEqual(["a", "b"]);
  });
});
