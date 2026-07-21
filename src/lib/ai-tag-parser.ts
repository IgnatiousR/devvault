import { AUTO_TAG_MAX_SUGGESTIONS } from "./ai-config";

const MAX_TAG_LENGTH = 50;

function stripFence(text: string): string {
  const fenceMatch = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  return fenceMatch ? fenceMatch[1].trim() : text;
}

function parseJsonTags(text: string): string[] | null {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.filter((t): t is string => typeof t === "string");
    }
    if (
      parsed &&
      typeof parsed === "object" &&
      "tags" in parsed &&
      Array.isArray((parsed as { tags: unknown }).tags)
    ) {
      return ((parsed as { tags: unknown }).tags as unknown[]).filter(
        (t): t is string => typeof t === "string"
      );
    }
    return null;
  } catch {
    return null;
  }
}

function deduplicateAndLimit(
  tags: string[],
  existingTags: string[]
): string[] {
  const normalizedExisting = new Set(
    existingTags.map((t) => t.trim().toLowerCase())
  );

  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    let normalized = tag.trim();
    if (normalized.startsWith("#")) {
      normalized = normalized.slice(1);
    }
    normalized = normalized.toLowerCase().replace(/\s+/g, " ").trim();

    if (normalized.length === 0 || normalized.length > MAX_TAG_LENGTH) {
      continue;
    }

    if (seen.has(normalized) || normalizedExisting.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);

    if (result.length >= AUTO_TAG_MAX_SUGGESTIONS) {
      break;
    }
  }

  return result;
}

export function parseAutoTags(raw: string, existingTags: string[]): string[] {
  if (!raw || raw.trim().length === 0) {
    return [];
  }

  const text = stripFence(raw.trim());
  const tags = parseJsonTags(text);
  if (!tags) {
    return [];
  }

  return deduplicateAndLimit(tags, existingTags);
}
