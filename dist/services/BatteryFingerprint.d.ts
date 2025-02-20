import { BrowserCharacteristics, FingerprintStrength } from '../interfaces/BrowserCharacteristics';
import { BaseFingerprint } from './BaseFingerprint';
export declare class BatteryFingerprint extends BaseFingerprint {
    getCharacteristics(): Promise<Partial<BrowserCharacteristics>>;
    getStrengthScore(): FingerprintStrength;
}
