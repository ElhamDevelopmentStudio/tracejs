const FALLBACK_SEGMENTS = 8;
const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIMES = [
  0x01000193,
  0x01000199,
  0x010001b3,
  0x010001d1,
  0x010001f3,
  0x01000221,
  0x0100023b,
  0x01000247,
];

const getCrypto = (): Crypto | null => {
  if (typeof globalThis !== "undefined" && globalThis.crypto) {
    return globalThis.crypto;
  }
  if (typeof window !== "undefined" && window.crypto) {
    return window.crypto;
  }
  return null;
};

const getSubtleCrypto = (): SubtleCrypto | null => {
  const cryptoObj = getCrypto();
  if (!cryptoObj) {
    return null;
  }

  type CryptoWithWebkit = Crypto & { webkitSubtle?: SubtleCrypto };
  const extendedCrypto = cryptoObj as CryptoWithWebkit;
  const subtle = extendedCrypto.subtle || extendedCrypto.webkitSubtle;
  return typeof subtle?.digest === "function" ? subtle : null;
};

const encodeToBuffer = (value: string): Uint8Array => {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value);
  }

  const utf8: number[] = [];
  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i);

    if (charCode < 0x80) {
      utf8.push(charCode);
    } else if (charCode < 0x800) {
      utf8.push(0xc0 | (charCode >> 6));
      utf8.push(0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      utf8.push(0xe0 | (charCode >> 12));
      utf8.push(0x80 | ((charCode >> 6) & 0x3f));
      utf8.push(0x80 | (charCode & 0x3f));
    } else {
      i++;
      if (i >= value.length) {
        break;
      }
      const surrogatePair = 0x10000 + (((charCode & 0x3ff) << 10) | (value.charCodeAt(i) & 0x3ff));
      utf8.push(0xf0 | (surrogatePair >> 18));
      utf8.push(0x80 | ((surrogatePair >> 12) & 0x3f));
      utf8.push(0x80 | ((surrogatePair >> 6) & 0x3f));
      utf8.push(0x80 | (surrogatePair & 0x3f));
    }
  }

  return new Uint8Array(utf8);
};

const toHexString = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const mixHash = (hash: number): number => {
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;
  return hash >>> 0;
};

const fallbackHash = (value: string): string => {
  const segments = new Array(FALLBACK_SEGMENTS)
    .fill(0)
    .map((_, index) => (FNV_OFFSET_BASIS ^ (index * 0x9e3779b9)) >>> 0);

  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i);

    for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
      let hash = segments[segmentIndex];
      const prime = FNV_PRIMES[segmentIndex];

      hash ^= charCode + segmentIndex * 31;
      hash = Math.imul(hash, prime);
      hash ^= hash >>> 13;
      hash = (hash << 7) | (hash >>> 25);
      segments[segmentIndex] = mixHash(hash);
    }
  }

  return segments.map((segment) => segment.toString(16).padStart(8, "0")).join("");
};

export const hashString = async (str: string): Promise<string> => {
  const subtle = getSubtleCrypto();

  if (subtle) {
    try {
      const msgBuffer = encodeToBuffer(str);
      const hashBuffer = await subtle.digest("SHA-256", msgBuffer);
      return toHexString(new Uint8Array(hashBuffer));
    } catch (error) {
      console.warn("SubtleCrypto digest failed, falling back to deterministic hash.", error);
    }
  }

  return fallbackHash(str);
};
