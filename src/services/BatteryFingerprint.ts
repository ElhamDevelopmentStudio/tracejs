import { BrowserCharacteristics, FingerprintStrength } from '../interfaces/BrowserCharacteristics';
import { BatteryOptions } from "../interfaces/FingerprintOptions";
import { BatteryData, BatteryManager, Navigator } from "../types/battery";
import { BaseFingerprint } from "./BaseFingerprint";

export class BatteryFingerprint extends BaseFingerprint {
  private options: BatteryOptions;
  private batteryManager: BatteryManager | null = null;
  private batteryChangeListeners: ((data: BatteryData) => void)[] = [];

  constructor(options: BatteryOptions = {}) {
    super();
    this.options = {
      includeCharging: true,
      includeLevel: true,
      includeChargingTime: true,
      includeDischargingTime: true,
      anonymizeLevel: false,
      trackStatusChanges: false,
      ...options,
    };

    // Initialize battery tracking if requested
    if (this.options.trackStatusChanges) {
      this.initBatteryTracking();
    }
  }

  private async initBatteryTracking(): Promise<void> {
    try {
      if ("getBattery" in navigator) {
        this.batteryManager = await (navigator as Navigator).getBattery();

        // Set up event listeners for battery changes
        this.batteryManager.addEventListener("chargingchange", () =>
          this.handleBatteryChange()
        );
        this.batteryManager.addEventListener("levelchange", () =>
          this.handleBatteryChange()
        );
        this.batteryManager.addEventListener("chargingtimechange", () =>
          this.handleBatteryChange()
        );
        this.batteryManager.addEventListener("dischargingtimechange", () =>
          this.handleBatteryChange()
        );
      }
    } catch (e) {
      console.error("Battery tracking initialization failed:", e);
    }
  }

  private handleBatteryChange(): void {
    if (!this.batteryManager) return;

    const batteryData = this.getBatteryData();

    // Trigger callback if provided
    if (this.options.onBatteryChange) {
      this.options.onBatteryChange(batteryData);
    }

    // Trigger any additional listeners
    this.batteryChangeListeners.forEach((listener) => listener(batteryData));
  }

  /**
   * Add a listener for battery status changes
   * @param listener Function to call when battery status changes
   * @returns Function to remove the listener
   */
  public onBatteryChange(listener: (data: BatteryData) => void): () => void {
    this.batteryChangeListeners.push(listener);

    // Initialize tracking if it wasn't already
    if (!this.batteryManager && "getBattery" in navigator) {
      this.initBatteryTracking();
    }

    // Return a function to remove the listener
    return () => {
      const index = this.batteryChangeListeners.indexOf(listener);
      if (index > -1) {
        this.batteryChangeListeners.splice(index, 1);
      }
    };
  }

  private getBatteryData(): BatteryData {
    if (!this.batteryManager) return {};

    const batteryData: BatteryData = {};

    if (this.options.includeCharging) {
      batteryData.charging = this.batteryManager.charging;
    }

    if (this.options.includeLevel) {
      const level = this.batteryManager.level;
      batteryData.level = this.options.anonymizeLevel
        ? Math.round(level * 10) / 10 // Round to nearest 10%
        : level;
    }

    if (this.options.includeChargingTime) {
      batteryData.chargingTime = this.batteryManager.chargingTime;
    }

    if (this.options.includeDischargingTime) {
      batteryData.dischargingTime = this.batteryManager.dischargingTime;
    }

    return batteryData;
  }

  async getCharacteristics(): Promise<Partial<BrowserCharacteristics>> {
    try {
      if ("getBattery" in navigator) {
        const battery = await (navigator as Navigator).getBattery();
        this.batteryManager = battery; // Store for future use

        const batteryData = this.getBatteryData();

        // Return null if no data was collected
        if (Object.keys(batteryData).length === 0) {
          return {};
        }

        return {
          battery: JSON.stringify(batteryData),
        };
      }
    } catch (e) {
      console.error("Battery fingerprinting failed:", e);
    }
    return {};
  }

  getStrengthScore(): FingerprintStrength {
    // If custom strength score is provided, use it
    if (this.options.customStrengthScore !== undefined) {
      return {
        score: this.options.customStrengthScore,
        details: ["Battery information available (custom score)"],
      };
    }

    // Calculate strength based on available properties
    let score = 0;
    const details: string[] = [];

    if (this.options.includeCharging) {
      score += 2;
      details.push("Battery charging status");
    }

    if (this.options.includeLevel) {
      score += this.options.anonymizeLevel ? 2 : 4;
      details.push(
        `Battery level ${this.options.anonymizeLevel ? "(anonymized)" : ""}`
      );
    }

    if (this.options.includeChargingTime) {
      score += 2;
      details.push("Battery charging time");
    }

    if (this.options.includeDischargingTime) {
      score += 2;
      details.push("Battery discharging time");
    }

    return {
      score,
      details: details.length > 0 ? details : ["Battery information available"],
    };
  }
}