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

vi.mock("@/lib/entitlements", () => ({
  getUserEntitlements: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/openrouter", () => ({
  OPENROUTER_FREE_MODEL: "openrouter/free",
  assertFreeOpenRouterModel: vi.fn(),
  getOpenRouterClient: vi.fn(),
}));

vi.mock("@/lib/ai-tag-parser", () => ({
  parseAutoTags: vi.fn(),
}));

import { generateAutoTags, generateDescription } from "../ai";
import { auth } from "@/lib/auth";
import { getUserEntitlements } from "@/lib/entitlements";
import { rateLimit } from "@/lib/rate-limit";
import { assertFreeOpenRouterModel, getOpenRouterClient } from "@/lib/openrouter";
import { parseAutoTags } from "@/lib/ai-tag-parser";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockGetUserEntitlements = vi.mocked(getUserEntitlements);
const mockRateLimit = vi.mocked(rateLimit);
const mockAssertFreeOpenRouterModel = vi.mocked(assertFreeOpenRouterModel);
const mockGetOpenRouterClient = vi.mocked(getOpenRouterClient);
const mockParseAutoTags = vi.mocked(parseAutoTags);

function setupAuth(userId: string | null) {
  if (userId) {
    mockGetSession.mockResolvedValue({
      user: { id: userId, email: "test@example.com" },
    } as never);
  } else {
    mockGetSession.mockResolvedValue(null);
  }
}

function setupEntitlements(isPro: boolean) {
  mockGetUserEntitlements.mockResolvedValue({
    isPro,
    maxItems: isPro ? Infinity : 50,
    maxCollections: isPro ? Infinity : 3,
    maxFileUploads: isPro,
    aiAccess: isPro,
    customItemTypes: isPro,
    exportEnabled: isPro,
  });
}

function setupRateLimit(denied: boolean = false) {
  mockRateLimit.mockResolvedValue(
    denied
      ? { success: false, remaining: 0, reset: 0 }
      : { success: true, remaining: 19, reset: 0 }
  );
}

function setupAiResponse(content: string) {
  mockGetOpenRouterClient.mockReturnValue({
    chat: {
      send: vi.fn().mockResolvedValue({
        choices: [{ message: { content } }],
      }),
    },
  } as never);
}

function setupProUser(denyRateLimit: boolean = false) {
  setupAuth("user-1");
  setupEntitlements(true);
  setupRateLimit(denyRateLimit);
}

describe("generateAutoTags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid input (empty title)", async () => {
    const result = await generateAutoTags({ title: "", content: "test content" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Invalid input");
  });

  it("rejects unauthenticated users", async () => {
    setupAuth(null);
    const result = await generateAutoTags({ title: "Test", content: "test content" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Unauthorized");
  });

  it("rejects users without aiAccess", async () => {
    setupAuth("user-1");
    setupEntitlements(false);
    setupRateLimit();
    const result = await generateAutoTags({ title: "Test", content: "test content" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("AI features require a Pro subscription");
  });

  it("rejects denied rate limit", async () => {
    setupProUser(true);
    const result = await generateAutoTags({ title: "Test", content: "test content" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("You have reached the AI request limit. Try again later.");
  });

  it("calls openrouter/free on success", async () => {
    setupProUser();
    setupAiResponse('{"tags":["typescript","react"]}');
    mockParseAutoTags.mockReturnValue(["typescript", "react"]);

    const result = await generateAutoTags({ title: "Test", content: "test content" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.tags).toEqual(["typescript", "react"]);
    expect(mockAssertFreeOpenRouterModel).toHaveBeenCalledWith("openrouter/free");
    expect(mockGetOpenRouterClient).toHaveBeenCalled();
  });
});

describe("generateDescription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid input (empty title)", async () => {
    const result = await generateDescription({ title: "", content: "test content" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Invalid input");
  });

  it("rejects unauthenticated users", async () => {
    setupAuth(null);
    const result = await generateDescription({ title: "Test", content: "test content" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Unauthorized");
  });

  it("rejects users without aiAccess", async () => {
    setupAuth("user-1");
    setupEntitlements(false);
    setupRateLimit();
    const result = await generateDescription({ title: "Test", content: "test content" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("AI features require a Pro subscription");
  });

  it("rejects denied rate limit", async () => {
    setupProUser(true);
    const result = await generateDescription({ title: "Test", content: "test content" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("You have reached the AI request limit. Try again later.");
  });

  it("returns trimmed description on success", async () => {
    setupProUser();
    setupAiResponse("  A React component.  ");
    const result = await generateDescription({ title: "Test", content: "test content" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.description).toBe("A React component.");
  });

  it("strips surrounding quotes", async () => {
    setupProUser();
    setupAiResponse('"A React component."');
    const result = await generateDescription({ title: "Test", content: "test content" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.description).toBe("A React component.");
  });
});
