import { AUTO_TAG_MAX_SUGGESTIONS } from "./ai-config";

const MAX_TAG_LENGTH = 50;

export function parseAutoTags(raw: string, existingTags: string[]): string[] {
  if (!raw || raw.trim().length === 0) {
    return [];
  }

  let text = raw.trim();

  const fenceMatch = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }

  let tags: string[];
  if (Array.isArray(parsed)) {
    tags = parsed.filter((t): t is string => typeof t === "string");
  } else if (parsed && typeof parsed === "object" && "tags" in parsed && Array.isArray((parsed as { tags: unknown }).tags)) {
    tags = ((parsed as { tags: unknown }).tags as unknown[]).filter((t): t is string => typeof t === "string");
  } else {
    return [];
  }

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
