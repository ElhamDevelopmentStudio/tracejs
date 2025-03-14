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
- ⚡ Asynchronous and performant
- 🛡️ TypeScript support
- 📱 Cross-browser compatibility

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
