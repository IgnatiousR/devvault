import { describe, it, expect } from "vitest";
import { buildItemCreatePayload, getDefaultType } from "./item-edit-utils";

describe("getDefaultType", () => {
  it("extracts type from /items/:type path", () => {
    expect(getDefaultType("/items/snippet")).toBe("snippet");
    expect(getDefaultType("/items/link")).toBe("link");
    expect(getDefaultType("/items/command")).toBe("command");
  });

  it("returns 'snippet' for unknown type", () => {
    expect(getDefaultType("/items/unknown")).toBe("snippet");
  });

  it("returns 'snippet' for non-item paths", () => {
    expect(getDefaultType("/dashboard")).toBe("snippet");
    expect(getDefaultType("/")).toBe("snippet");
  });

  it("returns 'snippet' for empty path", () => {
    expect(getDefaultType("")).toBe("snippet");
  });
});

describe("buildItemCreatePayload", () => {
  it("builds snippet payload with content and language", () => {
    const payload = buildItemCreatePayload(
      "snippet", "My Snippet", "A code snippet",
      "const x = 1;", "javascript", "",
      "js, code", null, []
    );
    expect(payload).toEqual({
      title: "My Snippet",
      description: "A code snippet",
      content: "const x = 1;",
      language: "javascript",
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      tags: ["js", "code"],
      itemTypeId: "snippet",
      collectionIds: [],
    });
  });

  it("builds link payload with url and no content", () => {
    const payload = buildItemCreatePayload(
      "link", "My Link", "", "", "", "https://example.com",
      "", null, ["c1"]
    );
    expect(payload).toEqual({
      title: "My Link",
      description: null,
      content: null,
      language: null,
      url: "https://example.com",
      fileUrl: null,
      fileName: null,
      fileSize: null,
      tags: [],
      itemTypeId: "link",
      collectionIds: ["c1"],
    });
  });

  it("builds file payload with uploaded file info", () => {
    const payload = buildItemCreatePayload(
      "file", "My File", "", "", "", "",
      "", { fileUrl: "/uploads/test.pdf", fileName: "test.pdf", fileSize: 1024 }, []
    );
    expect(payload.fileUrl).toBe("/uploads/test.pdf");
    expect(payload.fileName).toBe("test.pdf");
    expect(payload.fileSize).toBe(1024);
    expect(payload.content).toBeNull();
    expect(payload.language).toBeNull();
    expect(payload.itemTypeId).toBe("file");
  });

  it("handles prompt type with content but no language", () => {
    const payload = buildItemCreatePayload(
      "prompt", "My Prompt", "A great prompt",
      "Write a poem about", "", "",
      "", null, []
    );
    expect(payload.content).toBe("Write a poem about");
    expect(payload.language).toBeNull();
  });

  it("defaults unknown type to snippet itemTypeId", () => {
    const payload = buildItemCreatePayload(
      "unknown", "Test", "", "", "", "",
      "", null, []
    );
    expect(payload.itemTypeId).toBe("snippet");
  });

  it("coerces empty description to null", () => {
    const payload = buildItemCreatePayload(
      "snippet", "Test", "", "", "", "",
      "", null, []
    );
    expect(payload.description).toBeNull();
  });
});
