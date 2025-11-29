import { hashString } from "./hash";

describe("hashString", () => {
  const originalCrypto = globalThis.crypto;
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "crypto"
  );

  const setGlobalCrypto = (value: Crypto | undefined) => {
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      enumerable: true,
      value,
      writable: true,
    });
  };

  const restoreCrypto = () => {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, "crypto", originalDescriptor);
    } else {
      setGlobalCrypto(originalCrypto);
    }
  };

  afterEach(() => {
    restoreCrypto();
    jest.restoreAllMocks();
  });

  it("uses SubtleCrypto digest when available", async () => {
    const mockDigest = jest
      .fn()
      .mockResolvedValue(new Uint8Array([1, 2, 3, 4]).buffer);

    setGlobalCrypto({
      subtle: { digest: mockDigest },
    } as unknown as Crypto);

    const result = await hashString("abc");

    expect(mockDigest).toHaveBeenCalledTimes(1);
    expect(result).toBe("01020304");
  });

  it("falls back to deterministic hashing when SubtleCrypto is unavailable", async () => {
    setGlobalCrypto(undefined as unknown as Crypto);

    const result = await hashString("fallback");
    const repeat = await hashString("fallback");

    expect(result).toHaveLength(64);
    expect(result).toBe(repeat);
  });

  it("falls back when SubtleCrypto throws", async () => {
    const mockDigest = jest.fn().mockRejectedValue(new Error("no secure context"));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    setGlobalCrypto({
      subtle: { digest: mockDigest },
    } as unknown as Crypto);

    const result = await hashString("fallback-throws");

    expect(mockDigest).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(64);
    expect(warnSpy).toHaveBeenCalled();
  });
});
