# TraceJS

A modern, privacy-conscious alternative to browser fingerprinting for unique user identification. TraceJS provides a robust and ethical approach to device identification while respecting user privacy.

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/@elhamdev/tracejs.svg)](https://badge.fury.io/js/@elhamdev/tracejs)

## Features

- 🔒 Privacy-focused device identification
- 🎨 Advanced canvas fingerprinting
- 🖥️ Hardware-specific characteristics detection
- 🌐 Browser and OS information gathering
- 🎵 Audio capabilities fingerprinting
- 📊 Detailed fingerprint strength scoring
- 🧪 Real-time entropy analysis
- 🔍 Behavioral fingerprinting
- 📱 Cross-browser compatibility
- 🛡️ GDPR/CCPA compliant consent management
- ⚡ Asynchronous and performant
- 📖 TypeScript support
- 🔄 **Consistent fingerprinting** for authentication workflows
- 💾 Smart caching system for stable identification

## Installation

Install TraceJS using npm:

```bash
npm install @elhamdev/tracejs
```

Or using yarn:

```bash
yarn add @elhamdev/tracejs
```

## Usage

### Basic Usage

```typescript
import { FingerprintService } from 'tracejs';

// Initialize the fingerprint service
const fingerprintService = new FingerprintService();

// Generate a simple fingerprint
const fingerprint = await fingerprintService.generateFingerprint();
console.log('Device Fingerprint:', fingerprint);

// Get detailed fingerprint information
const detailedFingerprint = await fingerprintService.getDetailedFingerprint();
console.log('Detailed Information:', detailedFingerprint);
```

### Configuration Options

You can customize the fingerprinting process by passing options to the constructor:

```typescript
const options = {
  battery: false, // Disable battery fingerprinting
  screen: false   // Disable screen fingerprinting
};

const fingerprintService = new FingerprintService(options);
```

### Advanced Customization

TraceJS now provides enhanced customization capabilities for specific fingerprinting modules.

#### Battery Fingerprinting Options

Control exactly which battery data is collected and how it's processed:

```typescript
import { FingerprintService, BatteryOptions, BatteryData } from 'tracejs';

const batteryOptions: BatteryOptions = {
  // Select which properties to include (all true by default)
  includeCharging: true,
  includeLevel: true,
  includeChargingTime: true,
  includeDischargingTime: true,
  
  // Privacy enhancement - round battery level to nearest 10%
  anonymizeLevel: true,
  
  // Enable real-time battery status tracking
  trackStatusChanges: true,
  
  // Optional callback for battery changes
  onBatteryChange: (batteryData: BatteryData) => {
    console.log('Battery status changed:', batteryData);
  },
  
  // Override the fingerprint strength score (optional)
  customStrengthScore: 5
};

const fingerprintService = new FingerprintService({
  battery: batteryOptions
});

// Alternatively, you can listen for battery changes after initialization
const removeListener = fingerprintService.onBatteryChange((batteryData: BatteryData) => {
  console.log('Battery update:', batteryData);
});

// Later, to stop listening:
removeListener();
```

#### Behavioral Fingerprinting

TraceJS can now create fingerprints based on user behavior patterns, providing much stronger identification:

```typescript
import { FingerprintService, BehaviorOptions, BehaviorProfile } from 'tracejs';

const behaviorOptions: BehaviorOptions = {
  // Enable specific tracking methods
  trackMouse: true,
  trackKeyboard: true,
  trackTouch: true,
  
  // Configure privacy level
  privacyMode: 'balanced', // 'minimal', 'balanced', or 'full'
  
  // Configure data collection
  sampleRate: 100, // milliseconds between samples
  trainingDuration: 10000, // how long to collect data before generating profile (ms)
  
  // Receive updates when profile is created
  onProfileUpdate: (profile: BehaviorProfile) => {
    console.log('User behavior profile updated:', profile);
  }
};

const fingerprintService = new FingerprintService({
  behavior: behaviorOptions
});

// Or listen for profile updates separately
const cleanup = fingerprintService.onBehaviorProfileUpdate((profile) => {
  console.log('New behavior profile:', profile);
  
  // Access specific metrics
  if (profile.mouse?.averageSpeed) {
    console.log('Mouse speed:', profile.mouse.averageSpeed);
  }
  
  if (profile.keyboard?.typingSpeed) {
    console.log('Typing speed:', profile.keyboard.typingSpeed);
  }
});

// Call cleanup when done to remove event listeners
cleanup();
```

#### Entropy Analysis

Assess the quality and uniqueness of your fingerprint:

```typescript
import { FingerprintService } from 'tracejs';

const fingerprintService = new FingerprintService();

// Generate a fingerprint
const fingerprint = await fingerprintService.generateFingerprint();

// Analyze its entropy and uniqueness
const analysis = await fingerprintService.analyzeFingerprint();
console.log(`Entropy: ${analysis.entropyBits} bits`);
console.log(`Quality: ${analysis.quality.rating}`);
console.log(`Description: ${analysis.quality.description}`);

// Adjust your fingerprinting methods based on the analysis
if (analysis.entropyBits < 40) {
  console.log('Consider enabling additional fingerprinting methods for stronger identification');
}
```

#### Consistent Fingerprinting for Authentication

TraceJS provides fingerprint consistency suitable for authentication workflows:

```typescript
import { FingerprintService } from 'tracejs';

// Initialize the fingerprint service
const fingerprintService = new FingerprintService();

// On user login, generate a fingerprint
const loginFingerprint = await fingerprintService.generateFingerprint();
console.log('Login Fingerprint:', loginFingerprint);

// Send to your backend along with credentials
await loginUser(username, password, loginFingerprint);

// Later, on the same device (even days/weeks later)
// The fingerprint will remain consistent
const logoutFingerprint = await fingerprintService.generateFingerprint();
console.log('Logout Fingerprint:', logoutFingerprint);
// loginFingerprint === logoutFingerprint (unless hardware/browser changes significantly)

// Use for logout authentication
await logoutUser(sessionToken, logoutFingerprint);
```

How the consistency system works:
- Fingerprints are cached locally for 30 days by default
- Behavioral profiles remain stable between sessions
- Hardware-specific characteristics provide long-term stability
- Cache is safely invalidated if hardware or browser changes significantly
- Origin-specific cache keys prevent cross-site tracking

#### Consent Management

Ensure GDPR, CCPA, and other privacy regulation compliance:

```typescript
import { FingerprintService, ConsentOptions, ConsentCategory } from 'tracejs';

const consentOptions: ConsentOptions = {
  // Automatically detect user's region based on locale
  autoDetectRegion: true,
  
  // Map fingerprinting methods to consent categories
  categoryMapping: {
    battery: 'functionality',
    screen: 'functionality',
    canvas: 'analytics',
    audio: 'analytics', 
    behavior: 'personalization'
  },
  
  // Define required categories that don't need consent
  requiredCategories: ['essential'],
  
  // Get notifications when consent changes
  onConsentChange: (categories) => {
    console.log('Consent updated:', categories);
  }
};

const fingerprintService = new FingerprintService({
  battery: true,
  screen: true,
  behavior: true,
  consent: consentOptions
});

// Get the consent manager to interact with it
const consentManager = fingerprintService.getConsentManager();

// Check if consent has expired
if (consentManager?.needsConsentRenewal()) {
  // Show consent UI to user
  showConsentForm();
}

// Update consent when user makes choices
function onUserConsentFormSubmit(choices) {
  consentManager?.updateMultipleConsent({
    functionality: choices.includes('functionality'),
    analytics: choices.includes('analytics'),
    advertising: choices.includes('advertising'),
    personalization: choices.includes('personalization')
  });
}

// Get current consent state
const consentState = consentManager?.getConsentState();
console.log('Current consent:', consentState);
```

## API Documentation

### FingerprintService

#### Constructor
```typescript
constructor(options: FingerprintOptions = {})
```

Options:
- `battery`: boolean | BatteryOptions (default: true) - Enable/disable battery fingerprinting or customize it
- `screen`: boolean (default: true) - Enable/disable screen fingerprinting

#### Methods

##### generateFingerprint()
```typescript
async generateFingerprint(): Promise<string>
```
Returns a unique hash representing the device fingerprint.

##### getDetailedFingerprint()
```typescript
async getDetailedFingerprint(): Promise<{
  fingerprint: string;
  characteristics: Partial<BrowserCharacteristics>;
  strength: FingerprintStrength;
}>
```
Returns detailed information about the fingerprint, including:
- The fingerprint hash
- Collected characteristics
- Fingerprint strength assessment

##### onBatteryChange()
```typescript
onBatteryChange(listener: (data: BatteryData) => void): (() => void) | null
```
Registers a listener for battery status changes. Returns a function to remove the listener, or null if battery fingerprinting is disabled.

### BatteryOptions

Configure the battery fingerprinting module:

```typescript
interface BatteryOptions {
  // Which battery properties to include in fingerprinting
  includeCharging?: boolean;      // Include charging status
  includeLevel?: boolean;         // Include battery level
  includeChargingTime?: boolean;  // Include time until fully charged
  includeDischargingTime?: boolean; // Include time until battery depleted
  
  // Optional anonymization settings
  anonymizeLevel?: boolean;       // Round battery level to nearest 10%
  
  // Event tracking options
  trackStatusChanges?: boolean;   // Track battery status changes
  onBatteryChange?: (batteryData: BatteryData) => void; // Callback for changes
  
  // Custom strength scoring
  customStrengthScore?: number;   // Override default strength score
}

// The BatteryData type provides a type-safe structure for battery information
interface BatteryData {
  charging?: boolean;             // Whether the device is charging
  level?: number;                 // Battery level between 0 and 1
  chargingTime?: number;          // Seconds until fully charged
  dischargingTime?: number;       // Seconds until battery depleted
}
```

### BrowserCharacteristics

The following characteristics may be collected:

- `userAgent`: Browser user agent string
- `language`: Browser language
- `platform`: Operating system platform
- `hardwareConcurrency`: Number of logical processors
- `deviceMemory`: Amount of device memory
- `timezone`: User's timezone
- `touchPoints`: Maximum touch points
- `gpuVendor`: GPU vendor information
- `gpuRenderer`: GPU renderer information
- `canvas`: Canvas fingerprint
- `audio`: Audio capabilities
- And more...

### Caching Utilities

TraceJS provides utilities to maintain consistency in fingerprints:

```typescript
// These are typically used internally, but can be accessed for custom implementations
import { saveToCache, getFromCache, generateCacheKey } from 'tracejs/utils/cache';

// Generate a consistent cache key for your application
const cacheKey = generateCacheKey('my_feature');

// Save data to the cache (persists for 30 days by default)
saveToCache(cacheKey, { userData: 'example' });

// Retrieve cached data
const cachedData = getFromCache(cacheKey);
console.log(cachedData); // { userData: 'example' } or null if expired/not found

// Retrieve with custom validity period (in milliseconds)
const cachedDataWithCustomValidity = getFromCache(cacheKey, 60 * 60 * 1000); // 1 hour
```

## Privacy Considerations

TraceJS is designed with privacy in mind:
- No personal data collection
- No cross-site tracking
- No persistent storage
- Transparent fingerprinting methods
- Compliant with privacy regulations

## Contributing

We welcome contributions to TraceJS! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies (`npm install`)
4. Make your changes
5. Run tests (`npm test`)
6. Ensure linting passes (`npm run lint`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ElhamDevelopmentStudio/tracejs.git

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

### Code Style

- Follow TypeScript best practices
- Use ESLint for code linting
- Write comprehensive tests for new features
- Document new functionality
- Follow semantic versioning

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Author

Elhamullah Hossaini

## Support

- Report issues on [GitHub Issues](https://github.com/ElhamDevelopmentStudio/tracejs/issues)
- For security issues, please email security@tracejs.com
- Join our community discussions on [GitHub Discussions](https://github.com/ElhamDevelopmentStudio/tracejs/discussions)

## Acknowledgments

- Thanks to all contributors who have helped shape TraceJS
- Special thanks to the open-source community for their valuable feedback and contributions
