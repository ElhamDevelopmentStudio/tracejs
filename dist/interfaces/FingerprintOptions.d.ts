import { BehaviorOptions } from "../services/BehaviorFingerprint";
import { BatteryData } from "../types/battery";
import { ConsentOptions } from "./ConsentOptions";
export interface FingerprintOptions {
    battery?: boolean | BatteryOptions;
    canvas?: boolean;
    screen?: boolean;
    behavior?: boolean | BehaviorOptions;
    consent?: ConsentOptions;
}
export interface BatteryOptions {
    includeCharging?: boolean;
    includeLevel?: boolean;
    includeChargingTime?: boolean;
    includeDischargingTime?: boolean;
    anonymizeLevel?: boolean;
    trackStatusChanges?: boolean;
    onBatteryChange?: (batteryData: BatteryData) => void;
    customStrengthScore?: number;
}
