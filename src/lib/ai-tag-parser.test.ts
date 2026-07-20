import { describe, it, expect } from "vitest";
import { parseAutoTags } from "./ai-tag-parser";

describe("parseAutoTags", () => {
  it("parses a valid tags object", () => {
    const raw = '{"tags":["typescript","react","next.js"]}';
    expect(parseAutoTags(raw, [])).toEqual(["typescript", "react", "next.js"]);
  });

  it("parses a top-level array", () => {
    const raw = '["typescript","react","next.js"]';
    expect(parseAutoTags(raw, [])).toEqual(["typescript", "react", "next.js"]);
  });

  it("parses JSON inside a Markdown code fence", () => {
    const raw = '```json\n{"tags":["typescript","react"]}\n```';
    expect(parseAutoTags(raw, [])).toEqual(["typescript", "react"]);
  });

  it("parses code fence without language tag", () => {
    const raw = '```\n{"tags":["a","b"]}\n```';
    expect(parseAutoTags(raw, [])).toEqual(["a", "b"]);
  });

  it("lowercases tags", () => {
    const raw = '{"tags":["TypeScript","REACT","Next.JS"]}';
    expect(parseAutoTags(raw, [])).toEqual(["typescript", "react", "next.js"]);
  });

  it("trims whitespace", () => {
    const raw = '{"tags":["  typescript  ","  react  "]}';
    expect(parseAutoTags(raw, [])).toEqual(["typescript", "react"]);
  });

  it("strips leading #", () => {
    const raw = '{"tags":["#typescript","#react","#next.js"]}';
    expect(parseAutoTags(raw, [])).toEqual(["typescript", "react", "next.js"]);
  });

  it("deduplicates case-insensitively", () => {
    const raw = '{"tags":["TypeScript","typescript","TYPESCRIPT"]}';
    expect(parseAutoTags(raw, [])).toEqual(["typescript"]);
  });

  it("removes existing tags", () => {
    const raw = '{"tags":["typescript","react","next.js"]}';
    expect(parseAutoTags(raw, ["react"])).toEqual(["typescript", "next.js"]);
  });

  it("removes existing tags case-insensitively", () => {
    const raw = '{"tags":["TypeScript","React"]}';
    expect(parseAutoTags(raw, ["react"])).toEqual(["typescript"]);
  });

  it("limits to 5 tags", () => {
    const raw = '{"tags":["a","b","c","d","e","f","g"]}';
    expect(parseAutoTags(raw, [])).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("rejects empty tags", () => {
    const raw = '{"tags":["","  ","typescript"]}';
    expect(parseAutoTags(raw, [])).toEqual(["typescript"]);
  });

  it("rejects tags longer than 50 chars", () => {
    const longTag = "a".repeat(51);
    const raw = `{"tags":["${longTag}","ok"]}`;
    expect(parseAutoTags(raw, [])).toEqual(["ok"]);
  });

  it("collapses internal whitespace", () => {
    const raw = '{"tags":["hello   world"]}';
    expect(parseAutoTags(raw, [])).toEqual(["hello world"]);
  });

  it("returns empty array for empty content", () => {
    expect(parseAutoTags("", [])).toEqual([]);
  });

  it("returns empty array for whitespace-only content", () => {
    expect(parseAutoTags("   ", [])).toEqual([]);
  });

  it("returns empty array for malformed JSON", () => {
    expect(parseAutoTags("not json at all", [])).toEqual([]);
  });

  it("returns empty array for non-array, non-object JSON", () => {
    expect(parseAutoTags('"just a string"', [])).toEqual([]);
  });

  it("returns empty array for object without tags key", () => {
    expect(parseAutoTags('{"other":"data"}', [])).toEqual([]);
  });

  it("filters non-string values from array", () => {
    const raw = '{"tags":[123,true,null,"valid"]}';
    expect(parseAutoTags(raw, [])).toEqual(["valid"]);
  });

  it("handles tags object with non-array tags value", () => {
    const raw = '{"tags":"not-an-array"}';
    expect(parseAutoTags(raw, [])).toEqual([]);
  });

  it("returns empty when all tags are filtered out", () => {
    const raw = '{"tags":["react","next.js"]}';
    expect(parseAutoTags(raw, ["react", "next.js"])).toEqual([]);
  });
});
