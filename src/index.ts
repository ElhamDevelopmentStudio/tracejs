import { BrowserCharacteristics, FingerprintStrength } from './interfaces/BrowserCharacteristics';
import { FingerprintOptions } from './interfaces/FingerprintOptions';
import { BaseFingerprint } from './services/BaseFingerprint';
import { BatteryFingerprint } from './services/BatteryFingerprint';
import { ScreenFingerprint } from './services/ScreenFingerprint';
import { hashString } from './utils/hash';

export class FingerprintService {
  private fingerprinters: BaseFingerprint[] = [];

  constructor(options: FingerprintOptions = {}) {
    if (options.battery !== false) this.fingerprinters.push(new BatteryFingerprint());
    if (options.screen !== false) this.fingerprinters.push(new ScreenFingerprint());
  }

  async generateFingerprint(): Promise<string> {
    try {
      const fingerprintData = await Promise.all(
        this.fingerprinters.map(f => f.getFingerprintData())
      );
      
      const characteristics = fingerprintData.reduce((acc, curr) => ({
        ...acc,
        ...curr.characteristics
      }), {} as Partial<BrowserCharacteristics>);

      return hashString(JSON.stringify(characteristics));
    } catch (error) {
      console.error('Fingerprint generation error:', error);
      return '';
    }
  }

  async getFingerprintStrength(): Promise<FingerprintStrength> {
    try {
      const fingerprintData = await Promise.all(
        this.fingerprinters.map(f => f.getFingerprintData())
      );

      const totalScore = fingerprintData.reduce((acc, curr) => acc + curr.strength.score, 0);
      const allDetails = fingerprintData.flatMap(data => data.strength.details);

      return {
        score: totalScore / this.fingerprinters.length,
        details: allDetails
      };
    } catch (error) {
      console.error('Strength calculation error:', error);
      return {
        score: 0,
        details: ['Error calculating fingerprint strength']
      };
    }
  }

  async getDetailedFingerprint(): Promise<{
    fingerprint: string;
    characteristics: Partial<BrowserCharacteristics>;
    strength: FingerprintStrength;
  }> {
    try {
      const fingerprintData = await Promise.all(
        this.fingerprinters.map(f => f.getFingerprintData())
      );

      const characteristics = fingerprintData.reduce((acc, curr) => ({
        ...acc,
        ...curr.characteristics
      }), {} as Partial<BrowserCharacteristics>);

      const strength = await this.getFingerprintStrength();

      return {
        fingerprint: await hashString(JSON.stringify(characteristics)),
        characteristics,
        strength
      };
    } catch (error) {
      console.error('Detailed fingerprint generation error:', error);
      throw error;
    }
  }
}

export const createFingerprint = (options?: FingerprintOptions) => {
  return new FingerprintService(options);
};

export { BrowserCharacteristics, FingerprintStrength } from './interfaces/BrowserCharacteristics';
export { FingerprintOptions } from './interfaces/FingerprintOptions';

