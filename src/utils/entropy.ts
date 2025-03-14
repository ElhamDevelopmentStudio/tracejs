/**
 * Utilities for measuring fingerprint entropy and uniqueness
 */

// Define types for the characteristics data
interface BatteryInfo {
  charging?: boolean;
  level?: number;
  chargingTime?: number;
  dischargingTime?: number;
}

export interface FingerprintCharacteristics {
  battery?: string;
  screen?: string;
  canvas?: string;
  webglParams?: string;
  audio?: string;
  userAgent?: string;
  [key: string]: string | undefined;
}

/**
 * Calculate Shannon entropy of a string
 * Higher values indicate more randomness/uniqueness
 */
export function calculateStringEntropy(str: string): number {
  const len = str.length;

  // Count character frequencies
  const charFreq: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const char = str[i];
    charFreq[char] = (charFreq[char] || 0) + 1;
  }

  // Calculate entropy using Shannon formula
  let entropy = 0;
  for (const char in charFreq) {
    const freq = charFreq[char] / len;
    entropy -= freq * Math.log2(freq);
  }

  return entropy;
}

/**
 * Estimate bit entropy of a fingerprint
 * @param fingerprint The fingerprint string
 * @param characteristics The collected fingerprint characteristics
 * @returns Estimated bits of entropy
 */
export function estimateFingerprintEntropy(
  fingerprint: string,
  characteristics: Partial<FingerprintCharacteristics>
): number {
  // Base entropy from string randomness
  const baseEntropy = calculateStringEntropy(fingerprint);

  // Add entropy based on available characteristics
  let featureEntropy = 0;

  // Battery adds ~2-4 bits depending on whether level is included
  if (characteristics.battery) {
    featureEntropy += 2;

    try {
      const batteryData = JSON.parse(characteristics.battery) as BatteryInfo;
      if (batteryData.level !== undefined) featureEntropy += 2;
    } catch (e) {
      // Invalid JSON, use default
      featureEntropy += 1;
    }
  }

  // Screen adds ~4-8 bits
  if (characteristics.screen) featureEntropy += 6;

  // Canvas fingerprinting adds ~8-16 bits
  if (characteristics.canvas) featureEntropy += 12;

  // WebGL adds ~10-14 bits
  if (characteristics.webglParams) featureEntropy += 12;

  // Audio adds ~4-8 bits
  if (characteristics.audio) featureEntropy += 6;

  // User agent adds ~6-10 bits
  if (characteristics.userAgent) featureEntropy += 8;

  // Combine base entropy with feature entropy
  return Math.min(128, baseEntropy * 8 + featureEntropy);
}

/**
 * Get a qualitative assessment of fingerprint strength
 */
export function getFingerprintQuality(entropyBits: number): {
  rating: "weak" | "moderate" | "strong" | "very strong";
  description: string;
} {
  if (entropyBits < 20) {
    return {
      rating: "weak",
      description:
        "This fingerprint provides minimal identification capability and could apply to many devices.",
    };
  } else if (entropyBits < 40) {
    return {
      rating: "moderate",
      description:
        "This fingerprint provides reasonable identification but may not be unique across a large user base.",
    };
  } else if (entropyBits < 70) {
    return {
      rating: "strong",
      description:
        "This fingerprint provides strong identification and is likely unique for most practical purposes.",
    };
  } else {
    return {
      rating: "very strong",
      description:
        "This fingerprint provides excellent identification and is highly unique even across large user populations.",
    };
  }
}
