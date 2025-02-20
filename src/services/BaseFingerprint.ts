import { BrowserCharacteristics, FingerprintStrength } from '../interfaces/BrowserCharacteristics';

export abstract class BaseFingerprint {
  protected abstract getCharacteristics(): Promise<Partial<BrowserCharacteristics>>;
  protected abstract getStrengthScore(): FingerprintStrength;
  
  public async getFingerprint(): Promise<string> {
    const characteristics = await this.getCharacteristics();
    return JSON.stringify(characteristics);
  }

  public async getFingerprintData(): Promise<{
    characteristics: Partial<BrowserCharacteristics>;
    strength: FingerprintStrength;
  }> {
    return {
      characteristics: await this.getCharacteristics(),
      strength: this.getStrengthScore()
    };
  }
} 