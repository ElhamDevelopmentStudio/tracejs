import { BrowserCharacteristics, FingerprintStrength } from '../interfaces/BrowserCharacteristics';
import { BaseFingerprint } from './BaseFingerprint';
export declare class CanvasFingerprint extends BaseFingerprint {
    protected getCharacteristics(): Promise<Partial<BrowserCharacteristics>>;
    protected getStrengthScore(): FingerprintStrength;
}
