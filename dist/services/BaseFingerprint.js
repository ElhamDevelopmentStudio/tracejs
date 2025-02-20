"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseFingerprint = void 0;
class BaseFingerprint {
    async getFingerprint() {
        const characteristics = await this.getCharacteristics();
        return JSON.stringify(characteristics);
    }
    async getFingerprintData() {
        return {
            characteristics: await this.getCharacteristics(),
            strength: this.getStrengthScore()
        };
    }
}
exports.BaseFingerprint = BaseFingerprint;
