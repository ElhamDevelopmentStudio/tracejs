import { BrowserCharacteristics, FingerprintStrength } from '../interfaces/BrowserCharacteristics';
import { BaseFingerprint } from './BaseFingerprint';
export declare class ScreenFingerprint extends BaseFingerprint {
    getCharacteristics(): Promise<Partial<BrowserCharacteristics>>;
    private getColorGamut;
    private getColorScheme;
    getStrengthScore(): FingerprintStrength;
}
