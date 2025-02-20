import { BrowserCharacteristics, FingerprintStrength } from './interfaces/BrowserCharacteristics';
import { FingerprintOptions } from './interfaces/FingerprintOptions';
export declare class FingerprintService {
    private fingerprinters;
    constructor(options?: FingerprintOptions);
    generateFingerprint(): Promise<string>;
    getFingerprintStrength(): Promise<FingerprintStrength>;
    getDetailedFingerprint(): Promise<{
        fingerprint: string;
        characteristics: Partial<BrowserCharacteristics>;
        strength: FingerprintStrength;
    }>;
}
export declare const createFingerprint: (options?: FingerprintOptions) => FingerprintService;
export { BrowserCharacteristics, FingerprintStrength } from './interfaces/BrowserCharacteristics';
export { FingerprintOptions } from './interfaces/FingerprintOptions';
