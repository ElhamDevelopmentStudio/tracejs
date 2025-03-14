import { BrowserCharacteristics, FingerprintStrength } from './interfaces/BrowserCharacteristics';
import {
  BatteryOptions,
  FingerprintOptions,
} from "./interfaces/FingerprintOptions";
import { BaseFingerprint } from "./services/BaseFingerprint";
import { BatteryFingerprint } from "./services/BatteryFingerprint";
import {
  BehaviorFingerprint,
  BehaviorOptions,
} from "./services/BehaviorFingerprint";
import { ConsentManager } from "./services/ConsentManager";
import { ScreenFingerprint } from "./services/ScreenFingerprint";
import { BatteryData } from "./types/battery";
import { BehaviorProfile } from "./types/behavior";
import { generateCacheKey, getFromCache, saveToCache } from "./utils/cache";
import {
  estimateFingerprintEntropy,
  FingerprintCharacteristics,
  getFingerprintQuality,
} from "./utils/entropy";
import { hashString } from "./utils/hash";

// Export all public types
export {
  BrowserCharacteristics,
  FingerprintStrength,
} from "./interfaces/BrowserCharacteristics";
export {
  ConsentCategory,
  ConsentOptions,
  ConsentState,
} from "./interfaces/ConsentOptions";
export {
  BatteryOptions,
  FingerprintOptions,
} from "./interfaces/FingerprintOptions";
export { BehaviorOptions } from "./services/BehaviorFingerprint";
export { BatteryData } from "./types/battery";
export { BehaviorProfile } from "./types/behavior";

// Define the entropy analysis interface
export interface EntropyAnalysis {
  entropyBits: number;
  quality: {
    rating: "weak" | "moderate" | "strong" | "very strong";
    description: string;
  };
}

export class FingerprintService {
  private fingerprinters: BaseFingerprint[] = [];
  private batteryFingerprinter: BatteryFingerprint | null = null;
  private behaviorFingerprinter: BehaviorFingerprint | null = null;
  private consentManager: ConsentManager | null = null;
  private cachedCharacteristics: Partial<BrowserCharacteristics> | null = null;
  private cachedFingerprint: string | null = null;

  constructor(options: FingerprintOptions = {}) {
    // Initialize consent manager if consent options are provided
    if (options.consent) {
      this.consentManager = new ConsentManager(options.consent);
      // Initialize consent immediately
      this.consentManager
        .initialize()
        .catch((e) => console.error("Error initializing consent manager:", e));
    }

    // Initialize Battery fingerprinting
    if (options.battery !== false && this.hasConsent("battery")) {
      const batteryOptions: BatteryOptions =
        typeof options.battery === "object" ? options.battery : {};

      this.batteryFingerprinter = new BatteryFingerprint(batteryOptions);
      this.fingerprinters.push(this.batteryFingerprinter);
    }

    // Initialize Screen fingerprinting
    if (options.screen !== false && this.hasConsent("screen")) {
      this.fingerprinters.push(new ScreenFingerprint());
    }

    // Initialize Behavior fingerprinting
    if (options.behavior !== false && this.hasConsent("behavior")) {
      const behaviorOptions: BehaviorOptions =
        typeof options.behavior === "object" ? options.behavior : {};

      this.behaviorFingerprinter = new BehaviorFingerprint(behaviorOptions);
      this.fingerprinters.push(this.behaviorFingerprinter);
    }
  }

  /**
   * Check if a fingerprinting method has user consent
   * @param method The fingerprinting method to check
   * @returns Whether the method has consent
   */
  private hasConsent(method: string): boolean {
    if (!this.consentManager) {
      return true; // No consent manager means consent is assumed
    }

    return this.consentManager.hasConsent(method);
  }

  /**
   * Get the consent manager instance
   * @returns The consent manager instance, or null if not configured
   */
  public getConsentManager(): ConsentManager | null {
    return this.consentManager;
  }

  /**
   * Add a listener for battery status changes
   * @param listener Function to call when battery status changes
   * @returns Function to remove the listener, or null if battery fingerprinting is disabled
   */
  public onBatteryChange(
    listener: (data: BatteryData) => void
  ): (() => void) | null {
    if (!this.batteryFingerprinter) {
      return null;
    }

    if (!this.hasConsent("battery")) {
      console.warn("Battery tracking requires user consent");
      return null;
    }

    return this.batteryFingerprinter.onBatteryChange(listener);
  }

  /**
   * Add a listener for behavior profile updates
   * @param listener Function to call when behavior profile is updated
   * @returns Function to clean up the behavior fingerprinting, or null if behavior fingerprinting is disabled
   */
  public onBehaviorProfileUpdate(
    listener: (profile: BehaviorProfile) => void
  ): (() => void) | null {
    if (!this.behaviorFingerprinter) {
      return null;
    }

    if (!this.hasConsent("behavior")) {
      console.warn("Behavior tracking requires user consent");
      return null;
    }

    // Initialize behavior tracking if not already initialized
    this.behaviorFingerprinter.initialize();

    // Set up the profile update callback
    const options = {
      ...this.behaviorFingerprinter["options"],
      onProfileUpdate: listener,
    };
    this.behaviorFingerprinter["options"] = options;

    // Return a cleanup function
    return () => {
      if (this.behaviorFingerprinter) {
        this.behaviorFingerprinter.cleanup();
      }
    };
  }

  /**
   * Analyze the entropy and uniqueness of the current fingerprint
   * @returns Entropy analysis containing bits of entropy and quality assessment
   */
  public async analyzeFingerprint(): Promise<EntropyAnalysis> {
    // Make sure we have the latest fingerprint and characteristics
    if (!this.cachedFingerprint || !this.cachedCharacteristics) {
      const result = await this.getDetailedFingerprint();
      this.cachedFingerprint = result.fingerprint;
      this.cachedCharacteristics = result.characteristics;
    }

    // Calculate entropy
    const entropyBits = estimateFingerprintEntropy(
      this.cachedFingerprint,
      this
        .cachedCharacteristics as unknown as Partial<FingerprintCharacteristics>
    );

    // Get quality assessment
    const quality = getFingerprintQuality(entropyBits);

    return {
      entropyBits,
      quality,
    };
  }

  async generateFingerprint(): Promise<string> {
    try {
      // Check if we have a cached fingerprint
      const cacheKey = generateCacheKey("fingerprint");
      const cachedFingerprint = getFromCache<string>(cacheKey);

      if (cachedFingerprint) {
        this.cachedFingerprint = cachedFingerprint;
        return cachedFingerprint;
      }

      // No cached fingerprint, generate a new one
      const fingerprintData = await Promise.all(
        this.fingerprinters.map((f) => f.getFingerprintData())
      );

      const characteristics = fingerprintData.reduce(
        (acc, curr) => ({
          ...acc,
          ...curr.characteristics,
        }),
        {} as Partial<BrowserCharacteristics>
      );

      this.cachedCharacteristics = characteristics;
      const fingerprint = await hashString(JSON.stringify(characteristics));
      this.cachedFingerprint = fingerprint;

      // Save the fingerprint to cache for future consistency
      saveToCache(cacheKey, fingerprint);

      return fingerprint;
    } catch (error) {
      console.error("Fingerprint generation error:", error);
      return "";
    }
  }

  async getFingerprintStrength(): Promise<FingerprintStrength> {
    try {
      const fingerprintData = await Promise.all(
        this.fingerprinters.map((f) => f.getFingerprintData())
      );

      const totalScore = fingerprintData.reduce(
        (acc, curr) => acc + curr.strength.score,
        0
      );
      const allDetails = fingerprintData.flatMap(
        (data) => data.strength.details
      );

      return {
        score:
          this.fingerprinters.length > 0
            ? totalScore / this.fingerprinters.length
            : 0,
        details: allDetails,
      };
    } catch (error) {
      console.error("Strength calculation error:", error);
      return {
        score: 0,
        details: ["Error calculating fingerprint strength"],
      };
    }
  }

  async getDetailedFingerprint(): Promise<{
    fingerprint: string;
    characteristics: Partial<BrowserCharacteristics>;
    strength: FingerprintStrength;
  }> {
    try {
      const fingerprintData = await Promise.all(
        this.fingerprinters.map((f) => f.getFingerprintData())
      );

      const characteristics = fingerprintData.reduce(
        (acc, curr) => ({
          ...acc,
          ...curr.characteristics,
        }),
        {} as Partial<BrowserCharacteristics>
      );

      const strength = await this.getFingerprintStrength();
      const fingerprint = await hashString(JSON.stringify(characteristics));

      this.cachedCharacteristics = characteristics;
      this.cachedFingerprint = fingerprint;

      return {
        fingerprint,
        characteristics,
        strength,
      };
    } catch (error) {
      console.error("Detailed fingerprint generation error:", error);
      throw error;
    }
  }
}

export const createFingerprint = (options?: FingerprintOptions) => {
  return new FingerprintService(options);
};

