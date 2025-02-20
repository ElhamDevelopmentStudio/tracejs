"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFingerprint = exports.FingerprintService = void 0;
const BatteryFingerprint_1 = require("./services/BatteryFingerprint");
const ScreenFingerprint_1 = require("./services/ScreenFingerprint");
const hash_1 = require("./utils/hash");
class FingerprintService {
    constructor(options = {}) {
        this.fingerprinters = [];
        if (options.battery !== false)
            this.fingerprinters.push(new BatteryFingerprint_1.BatteryFingerprint());
        if (options.screen !== false)
            this.fingerprinters.push(new ScreenFingerprint_1.ScreenFingerprint());
    }
    async generateFingerprint() {
        try {
            const fingerprintData = await Promise.all(this.fingerprinters.map(f => f.getFingerprintData()));
            const characteristics = fingerprintData.reduce((acc, curr) => ({
                ...acc,
                ...curr.characteristics
            }), {});
            return (0, hash_1.hashString)(JSON.stringify(characteristics));
        }
        catch (error) {
            console.error('Fingerprint generation error:', error);
            return '';
        }
    }
    async getFingerprintStrength() {
        try {
            const fingerprintData = await Promise.all(this.fingerprinters.map(f => f.getFingerprintData()));
            const totalScore = fingerprintData.reduce((acc, curr) => acc + curr.strength.score, 0);
            const allDetails = fingerprintData.flatMap(data => data.strength.details);
            return {
                score: totalScore / this.fingerprinters.length,
                details: allDetails
            };
        }
        catch (error) {
            console.error('Strength calculation error:', error);
            return {
                score: 0,
                details: ['Error calculating fingerprint strength']
            };
        }
    }
    async getDetailedFingerprint() {
        try {
            const fingerprintData = await Promise.all(this.fingerprinters.map(f => f.getFingerprintData()));
            const characteristics = fingerprintData.reduce((acc, curr) => ({
                ...acc,
                ...curr.characteristics
            }), {});
            const strength = await this.getFingerprintStrength();
            return {
                fingerprint: await (0, hash_1.hashString)(JSON.stringify(characteristics)),
                characteristics,
                strength
            };
        }
        catch (error) {
            console.error('Detailed fingerprint generation error:', error);
            throw error;
        }
    }
}
exports.FingerprintService = FingerprintService;
const createFingerprint = (options) => {
    return new FingerprintService(options);
};
exports.createFingerprint = createFingerprint;
