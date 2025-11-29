import { generateCacheKey, getFromCache, saveToCache } from "./cache";
import * as environment from "./environment";

describe("cache utilities", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("generates deterministic keys without a window object", () => {
    jest.spyOn(environment, "getGlobalWindow").mockReturnValue(null);
    const key = generateCacheKey("fingerprint");
    expect(key.startsWith("tracejs_fingerprint_")).toBe(true);
  });

  it("gracefully no-ops when storage is unavailable", () => {
    jest.spyOn(environment, "getLocalStorage").mockReturnValue(null);
    expect(() => saveToCache("missing_storage", { ok: true })).not.toThrow();
    expect(getFromCache("missing_storage")).toBeNull();
  });
});
