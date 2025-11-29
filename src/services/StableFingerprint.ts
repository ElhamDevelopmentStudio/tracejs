import { BrowserCharacteristics, FingerprintStrength } from '../interfaces/BrowserCharacteristics';
import { getDocument, getGlobalWindow, getNavigator } from "../utils/environment";
import { BaseFingerprint } from './BaseFingerprint';

export class StableFingerprint extends BaseFingerprint {
  protected async getCharacteristics(): Promise<Partial<BrowserCharacteristics>> {
    try {
      const nav = getNavigator();
      const win = getGlobalWindow();
      const stableData = {
        // Browser/OS specific - doesn't change during session
        userAgent: nav?.userAgent,
        platform: nav?.platform,
        language: nav?.language,
        hardwareConcurrency: nav?.hardwareConcurrency,
        deviceMemory: (nav as any)?.deviceMemory,
        
        // Timezone - stable during session
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        
        // Hardware capabilities - stable
        touchPoints: nav?.maxTouchPoints,
        
        // Screen properties that don't change with multiple monitors
        colorDepth: win?.screen?.colorDepth,
        pixelDepth: win?.screen?.pixelDepth,
        devicePixelRatio: win?.devicePixelRatio,

        // WebGL information - hardware specific
        ...await this.getWebGLInfo(),
        
        // Audio capabilities - hardware specific
        ...await this.getAudioInfo(),
        
        // Canvas fingerprint - based on hardware rendering
        ...await this.getCanvasInfo()
      };

      return stableData;
    } catch (e) {
      console.error('Stable fingerprinting failed:', e);
      return {};
    }
  }

  private async getWebGLInfo(): Promise<Partial<BrowserCharacteristics>> {
    try {
      const doc = getDocument();
      if (!doc?.createElement) {
        return {};
      }

      const canvas = doc.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (gl) {
        const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          return {
            gpuVendor: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            gpuRenderer: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          };
        }
      }
    } catch (e) {
      console.error('WebGL fingerprinting failed:', e);
    }
    return {};
  }

  private async getAudioInfo(): Promise<Partial<BrowserCharacteristics>> {
    try {
      const win = getGlobalWindow() as typeof window & { webkitAudioContext?: typeof AudioContext };
      const AudioContextCtor = win?.AudioContext || win?.webkitAudioContext;
      if (!AudioContextCtor) {
        return {};
      }

      const audioContext = new AudioContextCtor();
      const sampleRate = audioContext.sampleRate;
      audioContext.close();
      return {
        audio: sampleRate.toString()
      };
    } catch (e) {
      console.error('Audio fingerprinting failed:', e);
      return {};
    }
  }

  private async getCanvasInfo(): Promise<Partial<BrowserCharacteristics>> {
    try {
      const doc = getDocument();
      if (!doc?.createElement) {
        return {};
      }

      const canvas = doc.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return {};

      canvas.width = 200;
      canvas.height = 50;
      
      // Use a consistent drawing that depends on hardware rendering
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('TraceJS!', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Stable', 4, 45);
      
      return {
        canvas: canvas.toDataURL()
      };
    } catch (e) {
      console.error('Canvas fingerprinting failed:', e);
      return {};
    }
  }

  protected getStrengthScore(): FingerprintStrength {
    return {
      score: 10,
      details: [
        'Hardware-specific characteristics',
        'Browser-specific information',
        'Stable during session'
      ]
    };
  }
} 
