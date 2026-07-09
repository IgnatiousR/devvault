import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatFileSize, getFilebaseKey } from "./filebase";

describe("formatFileSize", () => {
  it("returns '0 B' for zero bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("formats bytes correctly", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("formats kilobytes correctly", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(10240)).toBe("10 KB");
  });

  it("formats megabytes correctly", () => {
    expect(formatFileSize(1048576)).toBe("1 MB");
    expect(formatFileSize(5242880)).toBe("5 MB");
    expect(formatFileSize(10485760)).toBe("10 MB");
  });

  it("formats gigabytes correctly", () => {
    expect(formatFileSize(1073741824)).toBe("1 GB");
    expect(formatFileSize(2147483648)).toBe("2 GB");
  });

  it("handles edge cases", () => {
    expect(formatFileSize(1)).toBe("1 B");
    expect(formatFileSize(1025)).toBe("1 KB");
  });
});

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
