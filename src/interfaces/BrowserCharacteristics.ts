export interface BrowserCharacteristics {
  userAgent: string;
  language: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number;
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
  screen?: string;
  colorScheme?: string[];
  colorGamut?: string;
  behaviorProfile?: string;
}

export interface FingerprintStrength {
  score: number;
  details: string[];
} 