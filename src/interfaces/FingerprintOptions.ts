import { BehaviorOptions } from "../services/BehaviorFingerprint";
import { BatteryData } from "../types/battery";
import { ConsentOptions } from "./ConsentOptions";

export interface FingerprintOptions {
  battery?: boolean | BatteryOptions;
  canvas?: boolean;
  screen?: boolean;
  behavior?: boolean | BehaviorOptions;
  consent?: ConsentOptions;
  // Add other options as needed
}

export interface BatteryOptions {
  // Which battery properties to include in fingerprinting
  includeCharging?: boolean;
  includeLevel?: boolean;
  includeChargingTime?: boolean;
  includeDischargingTime?: boolean;

  // Optional anonymization settings
  anonymizeLevel?: boolean; // Round battery level to nearest 10%

  // Event tracking options
  trackStatusChanges?: boolean;
  onBatteryChange?: (batteryData: BatteryData) => void;

  // Custom strength scoring
  customStrengthScore?: number;
}
