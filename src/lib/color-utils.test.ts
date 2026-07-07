import { describe, it, expect } from "vitest";
import {
  getColorClasses,
  getColorBgClass,
  getColorBgAlphaClass,
  getColorTextClass,
} from "./color-utils";

describe("getColorClasses", () => {
  it("returns default color for null", () => {
    const result = getColorClasses(null);
    expect(result.bg).toBe("bg-blue-500");
    expect(result.bgAlpha).toBe("bg-blue-500/20");
    expect(result.text).toBe("text-blue-500");
  });

  it("returns default color for undefined", () => {
    const result = getColorClasses(undefined);
    expect(result.bg).toBe("bg-blue-500");
  });

  it("returns default color for unknown hex", () => {
    const result = getColorClasses("#000000");
    expect(result.bg).toBe("bg-blue-500");
  });

  it("returns correct classes for known colors", () => {
    const red = getColorClasses("#ef4444");
    expect(red.bg).toBe("bg-[var(--color-brand-red)]");
    expect(red.text).toBe("text-[var(--color-brand-red)]");

    const green = getColorClasses("#10b981");
    expect(green.bg).toBe("bg-emerald-500");
  });

  it("is case insensitive", () => {
    const result = getColorClasses("#EF4444");
    expect(result.bg).toBe("bg-[var(--color-brand-red)]");
  });
});

describe("getColorBgClass", () => {
  it("returns background class for color", () => {
    expect(getColorBgClass("#ef4444")).toBe("bg-[var(--color-brand-red)]");
    expect(getColorBgClass(null)).toBe("bg-blue-500");
  });
});

describe("getColorBgAlphaClass", () => {
  it("returns alpha background class for color", () => {
    expect(getColorBgAlphaClass("#ef4444")).toBe("bg-[var(--color-brand-red)]/20");
    expect(getColorBgAlphaClass(null)).toBe("bg-blue-500/20");
  });
});

describe("getColorTextClass", () => {
  it("returns text class for color", () => {
    expect(getColorTextClass("#ef4444")).toBe("text-[var(--color-brand-red)]");
    expect(getColorTextClass(null)).toBe("text-blue-500");
  });
});
