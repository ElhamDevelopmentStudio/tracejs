import { BrowserCharacteristics, FingerprintStrength } from '../interfaces/BrowserCharacteristics';
import { BaseFingerprint } from './BaseFingerprint';
export declare class StableFingerprint extends BaseFingerprint {
    protected getCharacteristics(): Promise<Partial<BrowserCharacteristics>>;
    private getWebGLInfo;
    private getAudioInfo;
    private getCanvasInfo;
    protected getStrengthScore(): FingerprintStrength;
}
