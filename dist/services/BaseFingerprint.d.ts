import { BrowserCharacteristics, FingerprintStrength } from '../interfaces/BrowserCharacteristics';
export declare abstract class BaseFingerprint {
    protected abstract getCharacteristics(): Promise<Partial<BrowserCharacteristics>>;
    protected abstract getStrengthScore(): FingerprintStrength;
    getFingerprint(): Promise<string>;
    getFingerprintData(): Promise<{
        characteristics: Partial<BrowserCharacteristics>;
        strength: FingerprintStrength;
    }>;
}
