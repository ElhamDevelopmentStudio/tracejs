interface BrowserCharacteristics {
  userAgent: string;
  language: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: any;
  timezoneOffset: number;
  timezone: string;
  touchPoints: number;
  doNotTrack?: string;
  sessionStorage?: boolean;
  localStorage?: boolean;
  indexedDb?: boolean;
  addBehavior?: boolean;
  openDatabase?: boolean;
  gpuVendor?: string;
  gpuRenderer?: string;
  fonts?: string;
  plugins?: string;
  canvas?: string;
  audio?: string;
  webglParams?: string;
  battery?: string;
  cpuClass?: string;
  deviceOrientation?: string;
}

class FingerprintService {
  private async getBrowserCharacteristics(): Promise<BrowserCharacteristics> {
    const characteristics: BrowserCharacteristics = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      timezoneOffset: new Date().getTimezoneOffset(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      touchPoints: navigator.maxTouchPoints,
      doNotTrack: navigator.doNotTrack || 'unspecified',
      sessionStorage: !!window.sessionStorage,
      localStorage: !!window.localStorage,
      indexedDb: !!window.indexedDB,
      addBehavior: !!(document.body && 'addBehavior' in document.body),
      openDatabase: !!(window as any).openDatabase,
    };

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          characteristics['gpuVendor'] = (
            gl as WebGLRenderingContext
          ).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          characteristics['gpuRenderer'] = (
            gl as WebGLRenderingContext
          ).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          characteristics.webglParams = JSON.stringify({
            vendor: characteristics['gpuVendor'],
            renderer: characteristics['gpuRenderer'],
          });
        }
      }
    } catch (e) {
      console.error('WebGL fingerprinting failed:', e);
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText('FingerprintJS', 10, 30);
        characteristics.canvas = canvas.toDataURL();
      }
    } catch (e) {
      console.error('Canvas fingerprinting failed:', e);
    }

    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      characteristics.audio = audioContext.sampleRate.toString();
      audioContext.close();
    } catch (e) {
      console.error('Audio fingerprinting failed:', e);
    }

    return characteristics;
  }

  /**
   * Generates a unique device fingerprint
   * @returns Promise<string> A hex string representing the device fingerprint
   */
  public async generateFingerprint(): Promise<string> {
    try {
      const characteristics = await this.getBrowserCharacteristics();

      const fingerprintString = Object.values(characteristics).join('|');

      const msgBuffer = new TextEncoder().encode(fingerprintString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      return hashHex;
    } catch (error) {
      console.error('Fingerprint generation error:', error);
      return '';
    }
  }

  public async getFingerprintStrength(): Promise<{
    score: number;
    details: string[];
  }> {
    const characteristics = await this.getBrowserCharacteristics();
    const details: string[] = [];
    let score = 0;

    if (characteristics.canvas) {
      score += 20;
      details.push('Canvas fingerprinting available');
    }
    if (characteristics.webglParams) {
      score += 25;
      details.push('WebGL parameters available');
    }
    if (characteristics.audio) {
      score += 15;
      details.push('Audio fingerprinting available');
    }
    if (characteristics.gpuRenderer) {
      score += 20;
      details.push('GPU information available');
    }

    return { score, details };
  }
}

export const fingerprintService = new FingerprintService();