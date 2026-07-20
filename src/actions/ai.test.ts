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

import { generateAutoTags, generateDescription, explainCode, optimizePrompt } from "./ai";
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

function mockAuth(userId: string | null) {
  if (userId) {
    mockGetSession.mockResolvedValue({
      user: { id: userId, email: "test@example.com" },
    } as never);
  } else {
    mockGetSession.mockResolvedValue(null);
  }
}

function mockEntitlements(aiAccess: boolean) {
  mockGetUserEntitlements.mockResolvedValue({
    isPro: aiAccess,
    maxItems: Infinity,
    maxCollections: Infinity,
    maxFileUploads: true,
    aiAccess,
    customItemTypes: true,
    exportEnabled: true,
  });
}

function mockRateLimitSuccess() {
  mockRateLimit.mockResolvedValue({ success: true, remaining: 19, reset: 0 });
}

function mockRateLimitDenied() {
  mockRateLimit.mockResolvedValue({ success: false, remaining: 0, reset: 0 });
}

function mockOpenRouterSuccess(content: string) {
  mockGetOpenRouterClient.mockReturnValue({
    chat: {
      send: vi.fn().mockResolvedValue({
        choices: [{ message: { content } }],
      }),
    },
  } as never);
}

function mockOpenRouterError(status: number) {
  const error = new Error("OpenRouter error") as Error & {
    response?: { status?: number };
    statusCode?: number;
  };
  if (status >= 400 && status < 500) {
    error.response = { status };
  } else {
    error.statusCode = status;
  }
  mockGetOpenRouterClient.mockReturnValue({
    chat: {
      send: vi.fn().mockRejectedValue(error),
    },
  } as never);
}

describe("generateAutoTags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid input (empty title)", async () => {
    const result = await generateAutoTags({
      title: "",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Invalid input");
    }
  });

  it("rejects unauthenticated users", async () => {
    mockAuth(null);

    const result = await generateAutoTags({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Unauthorized");
    }
  });

  it("rejects users without aiAccess", async () => {
    mockAuth("user-1");
    mockEntitlements(false);

    const result = await generateAutoTags({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("AI features require a Pro subscription");
    }
  });

  it("rejects denied rate limit", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitDenied();

    const result = await generateAutoTags({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You have reached the AI request limit. Try again later."
      );
    }
  });

  it("truncates content to 2,000 characters", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess('{"tags":["test"]}');
    mockParseAutoTags.mockReturnValue(["test"]);

    const longContent = "a".repeat(5_000);

    await generateAutoTags({
      title: "Test Item",
      content: longContent,
    });

    expect(mockParseAutoTags).toHaveBeenCalled();
    const callArgs = mockParseAutoTags.mock.calls[0];
    expect(callArgs).toBeDefined();
  });

  it("calls the model as openrouter/free", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess('{"tags":["test"]}');
    mockParseAutoTags.mockReturnValue(["test"]);

    await generateAutoTags({
      title: "Test Item",
      content: "test content",
    });

    expect(mockAssertFreeOpenRouterModel).toHaveBeenCalledWith("openrouter/free");
    expect(mockGetOpenRouterClient).toHaveBeenCalled();
  });

  it("verifies the free-model guard rejects openrouter/auto", async () => {
    mockAssertFreeOpenRouterModel.mockImplementation((model) => {
      if (model === "openrouter/auto") {
        throw new Error("Refusing to use non-free OpenRouter model: openrouter/auto");
      }
    });

    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess('{"tags":["test"]}');
    mockParseAutoTags.mockReturnValue(["test"]);

    await expect(
      generateAutoTags({
        title: "Test Item",
        content: "test content",
      })
    ).resolves.toBeDefined();
  });

  it("verifies the free-model guard rejects an un-suffixed provider model", async () => {
    mockAssertFreeOpenRouterModel.mockImplementation((model) => {
      if (!model.endsWith(":free") && model !== "openrouter/free") {
        throw new Error(
          `Refusing to use non-free OpenRouter model: ${model}`
        );
      }
    });

    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess('{"tags":["test"]}');
    mockParseAutoTags.mockReturnValue(["test"]);

    await expect(
      generateAutoTags({
        title: "Test Item",
        content: "test content",
      })
    ).resolves.toBeDefined();
  });

  it("parses { tags: [...] } response", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess('{"tags":["typescript","react"]}');
    mockParseAutoTags.mockReturnValue(["typescript", "react"]);

    const result = await generateAutoTags({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.tags).toEqual(["typescript", "react"]);
    }
  });

  it("parses a top-level array response", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess('["typescript","react"]');
    mockParseAutoTags.mockReturnValue(["typescript", "react"]);

    const result = await generateAutoTags({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.tags).toEqual(["typescript", "react"]);
    }
  });

  it("parses JSON inside a Markdown code fence", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess('```json\n{"tags":["typescript"]}\n```');
    mockParseAutoTags.mockReturnValue(["typescript"]);

    const result = await generateAutoTags({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.tags).toEqual(["typescript"]);
    }
  });

  it("lowercases, trims, strips #, deduplicates, and removes existing tags", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess('{"tags":["TypeScript","#react"]}');
    mockParseAutoTags.mockReturnValue(["typescript"]);

    const result = await generateAutoTags({
      title: "Test Item",
      content: "test content",
      existingTags: ["react"],
    });

    expect(result.success).toBe(true);
    expect(mockParseAutoTags).toHaveBeenCalledWith(
      expect.any(String),
      ["react"]
    );
  });

  it("limits the result to five tags", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess(
      '{"tags":["a","b","c","d","e","f","g"]}'
    );
    mockParseAutoTags.mockReturnValue(["a", "b", "c", "d", "e"]);

    const result = await generateAutoTags({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.tags).toHaveLength(5);
    }
  });

  it("returns a controlled error for empty content", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("");
    mockParseAutoTags.mockReturnValue([]);

    const result = await generateAutoTags({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "The AI service returned an invalid response. Try again."
      );
    }
  });

  it("returns a controlled error for malformed JSON", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("not valid json");
    mockParseAutoTags.mockReturnValue([]);

    const result = await generateAutoTags({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "The AI service returned an invalid response. Try again."
      );
    }
  });

  it("maps 429/provider-unavailable failures without retrying a paid model", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterError(429);

    const result = await generateAutoTags({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "Free AI models are busy or unavailable. Try again later."
      );
    }
  });

  it("maps 402 without retrying a paid model", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterError(402);

    const result = await generateAutoTags({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "Free AI models are busy or unavailable. Try again later."
      );
    }
  });

  it("handles a missing OPENROUTER_API_KEY", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockGetOpenRouterClient.mockImplementation(() => {
      throw new Error("OPENROUTER_API_KEY is not configured");
    });

    const result = await generateAutoTags({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("AI service configuration error");
    }
  });
});

describe("generateDescription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid input (empty title)", async () => {
    const result = await generateDescription({
      title: "",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Invalid input");
    }
  });

  it("rejects unauthenticated users", async () => {
    mockAuth(null);

    const result = await generateDescription({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Unauthorized");
    }
  });

  it("rejects users without aiAccess", async () => {
    mockAuth("user-1");
    mockEntitlements(false);

    const result = await generateDescription({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("AI features require a Pro subscription");
    }
  });

  it("rejects denied rate limit", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitDenied();

    const result = await generateDescription({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You have reached the AI request limit. Try again later."
      );
    }
  });

  it("calls the model as openrouter/free", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("A React component for handling user authentication.");

    await generateDescription({
      title: "Auth Component",
      content: "test content",
      itemType: "snippet",
      language: "typescript",
    });

    expect(mockAssertFreeOpenRouterModel).toHaveBeenCalledWith("openrouter/free");
    expect(mockGetOpenRouterClient).toHaveBeenCalled();
  });

  it("returns the generated description", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("A React component for handling user authentication.");

    const result = await generateDescription({
      title: "Auth Component",
      content: "export function Auth() { ... }",
      itemType: "snippet",
      language: "typescript",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.description).toBe(
        "A React component for handling user authentication."
      );
    }
  });

  it("strips surrounding quotes from the description", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess('"A React component for authentication."');

    const result = await generateDescription({
      title: "Auth Component",
      content: "test content",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.description).toBe("A React component for authentication.");
    }
  });

  it("trims whitespace from the description", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("  A React component for authentication.  ");

    const result = await generateDescription({
      title: "Auth Component",
      content: "test content",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.description).toBe("A React component for authentication.");
    }
  });

  it("returns a controlled error for empty content", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("");

    const result = await generateDescription({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "The AI service returned an invalid response. Try again."
      );
    }
  });

  it("maps 429/provider-unavailable failures without retrying a paid model", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterError(429);

    const result = await generateDescription({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "Free AI models are busy or unavailable. Try again later."
      );
    }
  });

  it("maps 402 without retrying a paid model", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterError(402);

    const result = await generateDescription({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "Free AI models are busy or unavailable. Try again later."
      );
    }
  });

  it("handles a missing OPENROUTER_API_KEY", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockGetOpenRouterClient.mockImplementation(() => {
      throw new Error("OPENROUTER_API_KEY is not configured");
    });

    const result = await generateDescription({
      title: "Test Item",
      content: "test content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("AI service configuration error");
    }
  });

  it("accepts optional fields (language, url, tags)", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("A useful link.");

    const result = await generateDescription({
      title: "Docs",
      url: "https://docs.example.com",
      tags: ["docs", "reference"],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.description).toBe("A useful link.");
    }
  });
});

describe("explainCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts Snippet", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("This is a React component that renders a user profile.");

    const result = await explainCode({
      itemType: "Snippet",
      content: "function Profile() { return <div>Hello</div>; }",
      language: "typescript",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.explanation).toBe("This is a React component that renders a user profile.");
    }
  });

  it("accepts Command", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("This lists all running Docker containers.");

    const result = await explainCode({
      itemType: "Command",
      content: "docker ps",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.explanation).toBe("This lists all running Docker containers.");
    }
  });

  it("rejects non-CODE_TYPES (Prompt)", async () => {
    const result = await explainCode({
      itemType: "Prompt" as "Snippet",
      content: "some content",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Invalid input");
    }
  });

  it("rejects empty content", async () => {
    const result = await explainCode({
      itemType: "Snippet",
      content: "   ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Invalid input");
    }
  });

  it("rejects unauthenticated users", async () => {
    mockAuth(null);

    const result = await explainCode({
      itemType: "Snippet",
      content: "test code",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Unauthorized");
    }
  });

  it("rejects users without aiAccess", async () => {
    mockAuth("user-1");
    mockEntitlements(false);

    const result = await explainCode({
      itemType: "Snippet",
      content: "test code",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("AI features require a Pro subscription");
    }
  });

  it("rejects denied rate limit", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitDenied();

    const result = await explainCode({
      itemType: "Snippet",
      content: "test code",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You have reached the AI request limit. Try again later."
      );
    }
  });

  it("truncates content to 12,000 characters server-side", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("This is an explanation.");

    const longContent = "a".repeat(20_000);

    const result = await explainCode({
      itemType: "Snippet",
      content: longContent,
    });

    expect(result.success).toBe(true);
  });

  it("calls the model as openrouter/free", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("explanation");

    await explainCode({
      itemType: "Snippet",
      content: "test code",
    });

    expect(mockAssertFreeOpenRouterModel).toHaveBeenCalledWith("openrouter/free");
    expect(mockGetOpenRouterClient).toHaveBeenCalled();
  });

  it("verifies the free-model guard rejects openrouter/auto", async () => {
    mockAssertFreeOpenRouterModel.mockImplementation((model) => {
      if (model === "openrouter/auto") {
        throw new Error("Refusing to use non-free OpenRouter model: openrouter/auto");
      }
    });

    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("explanation");

    await expect(
      explainCode({
        itemType: "Snippet",
        content: "test code",
      })
    ).resolves.toBeDefined();
  });

  it("verifies the free-model guard rejects an un-suffixed provider model", async () => {
    mockAssertFreeOpenRouterModel.mockImplementation((model) => {
      if (!model.endsWith(":free") && model !== "openrouter/free") {
        throw new Error(
          `Refusing to use non-free OpenRouter model: ${model}`
        );
      }
    });

    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("explanation");

    await expect(
      explainCode({
        itemType: "Snippet",
        content: "test code",
      })
    ).resolves.toBeDefined();
  });

  it("returns trimmed non-empty Markdown", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("  **Hello** world.  ");

    const result = await explainCode({
      itemType: "Snippet",
      content: "test code",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.explanation).toBe("**Hello** world.");
    }
  });

  it("returns a controlled error for empty/non-text output", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("");

    const result = await explainCode({
      itemType: "Snippet",
      content: "test code",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("The AI service returned an empty explanation. Try again.");
    }
  });

  it("maps 429/provider-unavailable errors without retrying a paid model", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterError(429);

    const result = await explainCode({
      itemType: "Snippet",
      content: "test code",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "Free AI models are busy or unavailable. Try again later."
      );
    }
  });

  it("maps 402 without retrying a paid model", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterError(402);

    const result = await explainCode({
      itemType: "Snippet",
      content: "test code",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "Free AI models are busy or unavailable. Try again later."
      );
    }
  });

  it("handles a missing OPENROUTER_API_KEY", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockGetOpenRouterClient.mockImplementation(() => {
      throw new Error("OPENROUTER_API_KEY is not configured");
    });

    const result = await explainCode({
      itemType: "Snippet",
      content: "test code",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("AI service configuration error");
    }
  });

  it("does not include user identity, collection metadata, or database IDs in the prompt", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();

    let capturedUserPrompt = "";
    mockGetOpenRouterClient.mockReturnValue({
      chat: {
        send: vi.fn().mockImplementation(({ chatRequest }: { chatRequest: { messages: Array<{ role: string; content: string }> } }) => {
          capturedUserPrompt = chatRequest.messages[1]?.content ?? "";
          return { choices: [{ message: { content: "explanation" } }] };
        }),
      },
    } as never);

    await explainCode({
      itemType: "Snippet",
      content: "test code",
    });

    expect(capturedUserPrompt).not.toContain("user-1");
    expect(capturedUserPrompt).not.toContain("userId");
    expect(capturedUserPrompt).not.toContain("collection");
  });
});

describe("optimizePrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects empty content", async () => {
    const result = await optimizePrompt({ content: "   " });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Invalid input");
    }
  });

  it("rejects unauthenticated users", async () => {
    mockAuth(null);

    const result = await optimizePrompt({ content: "some prompt" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Unauthorized");
    }
  });

  it("rejects users without aiAccess", async () => {
    mockAuth("user-1");
    mockEntitlements(false);

    const result = await optimizePrompt({ content: "some prompt" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("AI features require a Pro subscription");
    }
  });

  it("rejects denied rate limit", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitDenied();

    const result = await optimizePrompt({ content: "some prompt" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You have reached the AI request limit. Try again later."
      );
    }
  });

  it("calls the model as openrouter/free", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("Optimized prompt text");

    await optimizePrompt({ content: "some prompt" });

    expect(mockAssertFreeOpenRouterModel).toHaveBeenCalledWith("openrouter/free");
    expect(mockGetOpenRouterClient).toHaveBeenCalled();
  });

  it("returns trimmed non-empty content", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("  Optimized prompt text.  ");

    const result = await optimizePrompt({ content: "some prompt" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.optimized).toBe("Optimized prompt text.");
    }
  });

  it("truncates content to 12,000 characters server-side", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("Optimized");

    const longContent = "a".repeat(20_000);

    const result = await optimizePrompt({ content: longContent });

    expect(result.success).toBe(true);
  });

  it("returns a controlled error for empty/non-text output", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterSuccess("");

    const result = await optimizePrompt({ content: "some prompt" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("The AI service returned an empty response. Try again.");
    }
  });

  it("maps 429/provider-unavailable errors without retrying a paid model", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterError(429);

    const result = await optimizePrompt({ content: "some prompt" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "Free AI models are busy or unavailable. Try again later."
      );
    }
  });

  it("maps 402 without retrying a paid model", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockOpenRouterError(402);

    const result = await optimizePrompt({ content: "some prompt" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "Free AI models are busy or unavailable. Try again later."
      );
    }
  });

  it("handles a missing OPENROUTER_API_KEY", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();
    mockGetOpenRouterClient.mockImplementation(() => {
      throw new Error("OPENROUTER_API_KEY is not configured");
    });

    const result = await optimizePrompt({ content: "some prompt" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("AI service configuration error");
    }
  });

  it("does not include user identity, collection metadata, or database IDs in the prompt", async () => {
    mockAuth("user-1");
    mockEntitlements(true);
    mockRateLimitSuccess();

    let capturedUserPrompt = "";
    mockGetOpenRouterClient.mockReturnValue({
      chat: {
        send: vi.fn().mockImplementation(({ chatRequest }: { chatRequest: { messages: Array<{ role: string; content: string }> } }) => {
          capturedUserPrompt = chatRequest.messages[1]?.content ?? "";
          return { choices: [{ message: { content: "optimized" } }] };
        }),
      },
    } as never);

    await optimizePrompt({ content: "some prompt" });

    expect(capturedUserPrompt).not.toContain("user-1");
    expect(capturedUserPrompt).not.toContain("userId");
    expect(capturedUserPrompt).not.toContain("collection");
  });
});
