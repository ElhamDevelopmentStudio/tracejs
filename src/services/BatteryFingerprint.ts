import { BrowserCharacteristics, FingerprintStrength } from '../interfaces/BrowserCharacteristics';
import { BaseFingerprint } from './BaseFingerprint';

export class BatteryFingerprint extends BaseFingerprint {
  async getCharacteristics(): Promise<Partial<BrowserCharacteristics>> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return {
          battery: JSON.stringify({
            charging: battery.charging,
            level: battery.level,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
          })
        };
      }
    } catch (e) {
      console.error('Battery fingerprinting failed:', e);
    }
    return {};
  }

  getStrengthScore(): FingerprintStrength {
    return {
      score: 10,
      details: ['Battery information available']
    };
  }
}