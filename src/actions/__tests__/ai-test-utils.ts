import { vi } from "vitest";

export interface SharedAiMocks {
  getSession: ReturnType<typeof vi.fn>;
  getUserEntitlements: ReturnType<typeof vi.fn>;
  rateLimit: ReturnType<typeof vi.fn>;
  assertFreeOpenRouterModel: ReturnType<typeof vi.fn>;
  getOpenRouterClient: ReturnType<typeof vi.fn>;
  parseAutoTags: ReturnType<typeof vi.fn>;
}

export function createSharedAiMocks(): SharedAiMocks {
  return {
    getSession: vi.fn(),
    getUserEntitlements: vi.fn(),
    rateLimit: vi.fn(),
    assertFreeOpenRouterModel: vi.fn(),
    getOpenRouterClient: vi.fn(),
    parseAutoTags: vi.fn(),
  };
}

export function setupProUser(mocks: SharedAiMocks) {
  mocks.getSession.mockResolvedValue({
    user: { id: "user-1", email: "test@example.com" },
  } as never);
  mocks.getUserEntitlements.mockResolvedValue({
    isPro: true,
    maxItems: Infinity,
    maxCollections: Infinity,
    maxFileUploads: true,
    aiAccess: true,
    customItemTypes: true,
    exportEnabled: true,
  });
  mocks.rateLimit.mockResolvedValue({ success: true, remaining: 19, reset: 0 });
}

export function setupFreeUser(mocks: SharedAiMocks) {
  mocks.getSession.mockResolvedValue({
    user: { id: "user-1", email: "test@example.com" },
  } as never);
  mocks.getUserEntitlements.mockResolvedValue({
    isPro: false,
    maxItems: 50,
    maxCollections: 3,
    maxFileUploads: false,
    aiAccess: false,
    customItemTypes: false,
    exportEnabled: false,
  });
  mocks.rateLimit.mockResolvedValue({ success: true, remaining: 19, reset: 0 });
}

export function setupUnauthenticated(mocks: SharedAiMocks) {
  mocks.getSession.mockResolvedValue(null);
}

export function setupRateLimitDenied(mocks: SharedAiMocks) {
  mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0, reset: 0 });
}

export function setupMockAiResponse(mocks: SharedAiMocks, content: string) {
  mocks.getOpenRouterClient.mockReturnValue({
    chat: {
      send: vi.fn().mockResolvedValue({
        choices: [{ message: { content } }],
      }),
    },
  } as never);
}

export function setupMockAiError(mocks: SharedAiMocks, status: number) {
  const error = new Error("OpenRouter error") as Error & {
    response?: { status?: number };
    statusCode?: number;
  };
  if (status >= 400 && status < 500) {
    error.response = { status };
  } else {
    error.statusCode = status;
  }
  mocks.getOpenRouterClient.mockReturnValue({
    chat: {
      send: vi.fn().mockRejectedValue(error),
    },
  } as never);
}

export function setupMockAiKeyError(mocks: SharedAiMocks) {
  mocks.getOpenRouterClient.mockImplementation(() => {
    throw new Error("OPENROUTER_API_KEY is not configured");
  });
}

export function setupMockTags(mocks: SharedAiMocks, tags: string[]) {
  mocks.parseAutoTags.mockReturnValue(tags);
}