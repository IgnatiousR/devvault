import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getFilebaseKey } from "./filebase";

describe("getFilebaseKey", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("generates key with correct format", () => {
    const key = getFilebaseKey("user-123", "document.pdf");
    expect(key).toMatch(/^uploads\/user-123\/\d+-document\.pdf$/);
  });

  it("sanitizes special characters in filename", () => {
    const key = getFilebaseKey("user-123", "my file (1).pdf");
    expect(key).toMatch(/^uploads\/user-123\/\d+-my_file__1_\.pdf$/);
  });

  it("preserves allowed characters in filename", () => {
    const key = getFilebaseKey("user-123", "file-name_v2.txt");
    expect(key).toMatch(/^uploads\/user-123\/\d+-file-name_v2\.txt$/);
  });

  it("handles filename with dots", () => {
    const key = getFilebaseKey("user-123", "archive.tar.gz");
    expect(key).toMatch(/^uploads\/user-123\/\d+-archive\.tar\.gz$/);
  });

  it("uses userId in path", () => {
    const key = getFilebaseKey("user-456", "test.txt");
    expect(key).toContain("uploads/user-456/");
  });
});
