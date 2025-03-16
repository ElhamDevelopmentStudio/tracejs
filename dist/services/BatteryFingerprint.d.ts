import { BrowserCharacteristics, FingerprintStrength } from '../interfaces/BrowserCharacteristics';
import { BatteryOptions } from "../interfaces/FingerprintOptions";
import { BatteryData } from "../types/battery";
import { BaseFingerprint } from "./BaseFingerprint";
export declare class BatteryFingerprint extends BaseFingerprint {
    private options;
    private batteryManager;
    private batteryChangeListeners;
    constructor(options?: BatteryOptions);
    private initBatteryTracking;
    private handleBatteryChange;
    /**
     * Add a listener for battery status changes
     * @param listener Function to call when battery status changes
     * @returns Function to remove the listener
     */
    onBatteryChange(listener: (data: BatteryData) => void): () => void;
    private getBatteryData;
    getCharacteristics(): Promise<Partial<BrowserCharacteristics>>;
    getStrengthScore(): FingerprintStrength;
}
