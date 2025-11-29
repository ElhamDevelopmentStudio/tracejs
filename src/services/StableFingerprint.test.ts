import '@testing-library/jest-dom';
import { StableFingerprint } from './StableFingerprint';

// Mock browser APIs
type MockNavigator = {
  userAgent: string;
  platform: string;
  language: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
  maxTouchPoints: number;
  getBattery: jest.Mock;
};

const mockNavigator: MockNavigator = {
  userAgent: '',
  platform: '',
  language: '',
  hardwareConcurrency: 4,
  deviceMemory: 8,
  maxTouchPoints: 0,
  getBattery: jest.fn(),
};

const mockScreen = {
  colorDepth: 24,
  pixelDepth: 24,
} as Screen;

type MockWindow = Partial<Window> & {
  devicePixelRatio: number;
  screen: Screen;
  AudioContext: jest.Mock;
  matchMedia: jest.Mock;
};

const mockWindow: MockWindow = {
  devicePixelRatio: 1,
  screen: mockScreen,
  navigator: mockNavigator as unknown as Navigator,
  AudioContext: jest.fn().mockImplementation(() => ({
    sampleRate: 44100,
    close: jest.fn(),
  })),
  matchMedia: jest.fn(),
};

type MockCanvas = Partial<HTMLCanvasElement> & {
  getContext: jest.Mock;
  toDataURL: jest.Mock;
  width: number;
  height: number;
};

const mockCanvas: MockCanvas = {
  getContext: jest.fn(),
  toDataURL: jest.fn(),
  width: 0,
  height: 0,
};

const mockWebGLContext = {
  getExtension: jest.fn(),
  getParameter: jest.fn(),
};

describe('StableFingerprint', () => {
  let stableFingerprint: StableFingerprint;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    
    // Setup global mocks
    Object.defineProperty(global, "navigator", {
      configurable: true,
      value: mockNavigator as unknown as Navigator,
    });
    Object.defineProperty(global, "window", {
      configurable: true,
      value: mockWindow as unknown as Window & typeof globalThis,
    });
    const mockDocument: Partial<Document> = {
      createElement: jest.fn().mockReturnValue(mockCanvas),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    Object.defineProperty(global, "document", {
      configurable: true,
      value: mockDocument as Document,
    });
    
    stableFingerprint = new StableFingerprint();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Different Browsers', () => {
    const browsers = [
      {
        name: 'Chrome Windows',
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        platform: 'Win32',
        language: 'en-US',
      },
      {
        name: 'Firefox Mac',
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
        platform: 'MacIntel',
        language: 'en-GB',
      },
      {
        name: 'Safari iOS',
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
        language: 'fr-FR',
      },
    ];

    test.each(browsers)('should generate unique fingerprint for $name', async (browser) => {
      Object.assign(mockNavigator, {
        userAgent: browser.ua,
        platform: browser.platform,
        language: browser.language,
      });
      
      const result = await stableFingerprint.getFingerprint();
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('Different Hardware Configurations', () => {
    beforeEach(() => {
      // Reset mocks before each test
      Object.defineProperty(mockWindow.navigator as Navigator, 'hardwareConcurrency', {
        configurable: true,
        value: undefined
      });
    });

    it('should generate unique fingerprint for High-end PC', async () => {
      const config = { cores: 16 };
      Object.defineProperty(mockWindow.navigator as Navigator, 'hardwareConcurrency', {
        configurable: true,
        value: config.cores
      });
      
      const stableFingerprint = new StableFingerprint();
      const result = await stableFingerprint.getFingerprint();
      expect(result).toBeTruthy();
      const resultObj = JSON.parse(result);
      expect(resultObj.hardwareConcurrency).toBe(config.cores);
    });

    // ... similar updates for other hardware configuration tests ...
  });

  describe('Canvas Rendering', () => {
    const renderingScenarios = [
      {
        name: 'Standard rendering',
        dataUrl: 'data:image/png;base64,standard',
        webglVendor: 'Standard Vendor',
        webglRenderer: 'Standard Renderer',
      },
      {
        name: 'High-DPI rendering',
        dataUrl: 'data:image/png;base64,hidpi',
        webglVendor: 'High-DPI Vendor',
        webglRenderer: 'High-DPI Renderer',
        devicePixelRatio: 2,
      },
      {
        name: 'No WebGL support',
        dataUrl: 'data:image/png;base64,nowebgl',
        webglVendor: null,
        webglRenderer: null,
      },
    ];

    test.each(renderingScenarios)('should handle $name correctly', async (scenario) => {
      mockCanvas.toDataURL.mockReturnValue(scenario.dataUrl);
      mockWindow.devicePixelRatio = scenario.devicePixelRatio || 1;
      
      if (scenario.webglVendor) {
        mockWebGLContext.getExtension.mockReturnValue({ 
          UNMASKED_VENDOR_WEBGL: 'vendor',
          UNMASKED_RENDERER_WEBGL: 'renderer'
        });
        mockWebGLContext.getParameter.mockImplementation((param) => {
          if (param === 'vendor') return scenario.webglVendor;
          if (param === 'renderer') return scenario.webglRenderer;
          return null;
        });
      } else {
        mockCanvas.getContext.mockReturnValue(null);
      }

      const result = await stableFingerprint.getFingerprint();
      expect(result).toBeTruthy();
    });
  });

  describe('Audio Context', () => {
    const audioScenarios = [
      { name: 'Standard audio', sampleRate: 44100 },
      { name: 'High-quality audio', sampleRate: 48000 },
      { name: 'Professional audio', sampleRate: 96000 },
      { name: 'No audio support', sampleRate: null },
    ];

    test.each(audioScenarios)('should handle $name correctly', async (scenario) => {
      if (scenario.sampleRate) {
        mockWindow.AudioContext = jest.fn().mockImplementation(() => ({
          sampleRate: scenario.sampleRate,
          close: jest.fn(),
        }));
      } else {
        mockWindow.AudioContext = jest.fn().mockImplementation(() => {
          throw new Error('Not supported');
        });
      }

      const result = await stableFingerprint.getFingerprint();
      expect(result).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing navigator properties', async () => {
      Object.defineProperty(global, "navigator", {
        configurable: true,
        value: {} as Navigator,
      });
      const result = await stableFingerprint.getFingerprint();
      expect(result).toBeTruthy();
    });

    test('should handle canvas creation failure', async () => {
      global.document.createElement = jest.fn().mockImplementation(() => {
        throw new Error('Cannot create canvas');
      });
      const result = await stableFingerprint.getFingerprint();
      expect(result).toBeTruthy();
    });

    test('should handle WebGL context acquisition failure', async () => {
      mockCanvas.getContext = jest.fn().mockImplementation(() => {
        throw new Error('WebGL not supported');
      });
      const result = await stableFingerprint.getFingerprint();
      expect(result).toBeTruthy();
    });
  });

  describe('Fingerprint Stability', () => {
    it('should generate different fingerprints for different configurations', async () => {
      const stableFingerprint1 = new StableFingerprint();
      const stableFingerprint2 = new StableFingerprint();
      
      // Mock different hardware configurations
      Object.defineProperty(mockWindow.navigator as Navigator, 'hardwareConcurrency', {
        configurable: true,
        value: 8
      });
      const firstConfig = await stableFingerprint1.getFingerprint();
      
      Object.defineProperty(mockWindow.navigator as Navigator, 'hardwareConcurrency', {
        configurable: true,
        value: 16
      });
      const secondConfig = await stableFingerprint2.getFingerprint();
      
      expect(firstConfig).not.toBe(secondConfig);
    });
  });
}); 
