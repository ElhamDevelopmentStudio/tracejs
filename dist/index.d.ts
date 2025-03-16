import { BrowserCharacteristics, FingerprintStrength } from './interfaces/BrowserCharacteristics';
import { FingerprintOptions } from "./interfaces/FingerprintOptions";
import { ConsentManager } from "./services/ConsentManager";
import { BatteryData } from "./types/battery";
import { BehaviorProfile } from "./types/behavior";
export { BrowserCharacteristics, FingerprintStrength, } from "./interfaces/BrowserCharacteristics";
export { ConsentCategory, ConsentOptions, ConsentState, } from "./interfaces/ConsentOptions";
export { BatteryOptions, FingerprintOptions, } from "./interfaces/FingerprintOptions";
export { BehaviorOptions } from "./services/BehaviorFingerprint";
export { BatteryData } from "./types/battery";
export { BehaviorProfile } from "./types/behavior";
export interface EntropyAnalysis {
    entropyBits: number;
    quality: {
        rating: "weak" | "moderate" | "strong" | "very strong";
        description: string;
    };
}
export declare class FingerprintService {
    private fingerprinters;
    private batteryFingerprinter;
    private behaviorFingerprinter;
    private consentManager;
    private cachedCharacteristics;
    private cachedFingerprint;
    constructor(options?: FingerprintOptions);
    /**
     * Check if a fingerprinting method has user consent
     * @param method The fingerprinting method to check
     * @returns Whether the method has consent
     */
    private hasConsent;
    /**
     * Get the consent manager instance
     * @returns The consent manager instance, or null if not configured
     */
    getConsentManager(): ConsentManager | null;
    /**
     * Add a listener for battery status changes
     * @param listener Function to call when battery status changes
     * @returns Function to remove the listener, or null if battery fingerprinting is disabled
     */
    onBatteryChange(listener: (data: BatteryData) => void): (() => void) | null;
    /**
     * Add a listener for behavior profile updates
     * @param listener Function to call when behavior profile is updated
     * @returns Function to clean up the behavior fingerprinting, or null if behavior fingerprinting is disabled
     */
    onBehaviorProfileUpdate(listener: (profile: BehaviorProfile) => void): (() => void) | null;
    /**
     * Analyze the entropy and uniqueness of the current fingerprint
     * @returns Entropy analysis containing bits of entropy and quality assessment
     */
    analyzeFingerprint(): Promise<EntropyAnalysis>;
    generateFingerprint(): Promise<string>;
    getFingerprintStrength(): Promise<FingerprintStrength>;
    getDetailedFingerprint(): Promise<{
        fingerprint: string;
        characteristics: Partial<BrowserCharacteristics>;
        strength: FingerprintStrength;
    }>;
}
export declare const createFingerprint: (options?: FingerprintOptions) => FingerprintService;
