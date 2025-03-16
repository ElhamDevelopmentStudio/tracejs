"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFingerprint = exports.FingerprintService = void 0;
const BatteryFingerprint_1 = require("./services/BatteryFingerprint");
const BehaviorFingerprint_1 = require("./services/BehaviorFingerprint");
const ConsentManager_1 = require("./services/ConsentManager");
const ScreenFingerprint_1 = require("./services/ScreenFingerprint");
const cache_1 = require("./utils/cache");
const entropy_1 = require("./utils/entropy");
const hash_1 = require("./utils/hash");
class FingerprintService {
    constructor(options = {}) {
        this.fingerprinters = [];
        this.batteryFingerprinter = null;
        this.behaviorFingerprinter = null;
        this.consentManager = null;
        this.cachedCharacteristics = null;
        this.cachedFingerprint = null;
        // Initialize consent manager if consent options are provided
        if (options.consent) {
            this.consentManager = new ConsentManager_1.ConsentManager(options.consent);
            // Initialize consent immediately
            this.consentManager
                .initialize()
                .catch((e) => console.error("Error initializing consent manager:", e));
        }
        // Initialize Battery fingerprinting
        if (options.battery !== false && this.hasConsent("battery")) {
            const batteryOptions = typeof options.battery === "object" ? options.battery : {};
            this.batteryFingerprinter = new BatteryFingerprint_1.BatteryFingerprint(batteryOptions);
            this.fingerprinters.push(this.batteryFingerprinter);
        }
        // Initialize Screen fingerprinting
        if (options.screen !== false && this.hasConsent("screen")) {
            this.fingerprinters.push(new ScreenFingerprint_1.ScreenFingerprint());
        }
        // Initialize Behavior fingerprinting
        if (options.behavior !== false && this.hasConsent("behavior")) {
            const behaviorOptions = typeof options.behavior === "object" ? options.behavior : {};
            this.behaviorFingerprinter = new BehaviorFingerprint_1.BehaviorFingerprint(behaviorOptions);
            this.fingerprinters.push(this.behaviorFingerprinter);
        }
    }
    /**
     * Check if a fingerprinting method has user consent
     * @param method The fingerprinting method to check
     * @returns Whether the method has consent
     */
    hasConsent(method) {
        if (!this.consentManager) {
            return true; // No consent manager means consent is assumed
        }
        return this.consentManager.hasConsent(method);
    }
    /**
     * Get the consent manager instance
     * @returns The consent manager instance, or null if not configured
     */
    getConsentManager() {
        return this.consentManager;
    }
    /**
     * Add a listener for battery status changes
     * @param listener Function to call when battery status changes
     * @returns Function to remove the listener, or null if battery fingerprinting is disabled
     */
    onBatteryChange(listener) {
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
    onBehaviorProfileUpdate(listener) {
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
    async analyzeFingerprint() {
        // Make sure we have the latest fingerprint and characteristics
        if (!this.cachedFingerprint || !this.cachedCharacteristics) {
            const result = await this.getDetailedFingerprint();
            this.cachedFingerprint = result.fingerprint;
            this.cachedCharacteristics = result.characteristics;
        }
        // Calculate entropy
        const entropyBits = (0, entropy_1.estimateFingerprintEntropy)(this.cachedFingerprint, this
            .cachedCharacteristics);
        // Get quality assessment
        const quality = (0, entropy_1.getFingerprintQuality)(entropyBits);
        return {
            entropyBits,
            quality,
        };
    }
    async generateFingerprint() {
        try {
            // Check if we have a cached fingerprint
            const cacheKey = (0, cache_1.generateCacheKey)("fingerprint");
            const cachedFingerprint = (0, cache_1.getFromCache)(cacheKey);
            if (cachedFingerprint) {
                this.cachedFingerprint = cachedFingerprint;
                return cachedFingerprint;
            }
            // No cached fingerprint, generate a new one
            const fingerprintData = await Promise.all(this.fingerprinters.map((f) => f.getFingerprintData()));
            const characteristics = fingerprintData.reduce((acc, curr) => ({
                ...acc,
                ...curr.characteristics,
            }), {});
            this.cachedCharacteristics = characteristics;
            const fingerprint = await (0, hash_1.hashString)(JSON.stringify(characteristics));
            this.cachedFingerprint = fingerprint;
            // Save the fingerprint to cache for future consistency
            (0, cache_1.saveToCache)(cacheKey, fingerprint);
            return fingerprint;
        }
        catch (error) {
            console.error("Fingerprint generation error:", error);
            return "";
        }
    }
    async getFingerprintStrength() {
        try {
            const fingerprintData = await Promise.all(this.fingerprinters.map((f) => f.getFingerprintData()));
            const totalScore = fingerprintData.reduce((acc, curr) => acc + curr.strength.score, 0);
            const allDetails = fingerprintData.flatMap((data) => data.strength.details);
            return {
                score: this.fingerprinters.length > 0
                    ? totalScore / this.fingerprinters.length
                    : 0,
                details: allDetails,
            };
        }
        catch (error) {
            console.error("Strength calculation error:", error);
            return {
                score: 0,
                details: ["Error calculating fingerprint strength"],
            };
        }
    }
    async getDetailedFingerprint() {
        try {
            const fingerprintData = await Promise.all(this.fingerprinters.map((f) => f.getFingerprintData()));
            const characteristics = fingerprintData.reduce((acc, curr) => ({
                ...acc,
                ...curr.characteristics,
            }), {});
            const strength = await this.getFingerprintStrength();
            const fingerprint = await (0, hash_1.hashString)(JSON.stringify(characteristics));
            this.cachedCharacteristics = characteristics;
            this.cachedFingerprint = fingerprint;
            return {
                fingerprint,
                characteristics,
                strength,
            };
        }
        catch (error) {
            console.error("Detailed fingerprint generation error:", error);
            throw error;
        }
    }
}
exports.FingerprintService = FingerprintService;
const createFingerprint = (options) => {
    return new FingerprintService(options);
};
exports.createFingerprint = createFingerprint;
