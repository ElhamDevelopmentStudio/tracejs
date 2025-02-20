interface Navigator {
  deviceMemory?: number;
  getBattery?: () => Promise<{
    charging: boolean;
    level: number;
    chargingTime: number;
    dischargingTime: number;
  }>;
}

interface Window {
  webkitAudioContext: typeof AudioContext;
}

interface WebGLRenderingContext {
  getExtension(name: 'WEBGL_debug_renderer_info'): {
    UNMASKED_VENDOR_WEBGL: number;
    UNMASKED_RENDERER_WEBGL: number;
  } | null;
} 