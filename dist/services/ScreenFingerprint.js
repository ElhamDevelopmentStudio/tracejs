"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenFingerprint = void 0;
const BaseFingerprint_1 = require("./BaseFingerprint");
class ScreenFingerprint extends BaseFingerprint_1.BaseFingerprint {
    async getCharacteristics() {
        try {
            // Get only primary screen characteristics that don't change with multiple monitors
            const screenData = {
                // Color depth is typically consistent across monitors
                colorDepth: window.screen.colorDepth,
                // Use pixelDepth as it's usually consistent
                pixelDepth: window.screen.pixelDepth,
                // Device pixel ratio is browser/OS specific, not monitor specific
                devicePixelRatio: window.devicePixelRatio,
                // Check if device orientation is available (mobile devices)
                orientationType: screen.orientation?.type || 'undefined',
                // Check color gamut support - this is device/browser specific, not monitor specific
                colorGamut: this.getColorGamut(),
                // Get supported color schemes
                colorScheme: this.getColorScheme(),
            };
            return {
                screen: JSON.stringify(screenData)
            };
        }
        catch (e) {
            console.error('Screen fingerprinting failed:', e);
            return {};
        }
    }
    getColorGamut() {
        // Check color gamut support using CSS media queries
        if (window.matchMedia('(color-gamut: rec2020)').matches)
            return 'rec2020';
        if (window.matchMedia('(color-gamut: p3)').matches)
            return 'p3';
        if (window.matchMedia('(color-gamut: srgb)').matches)
            return 'srgb';
        return 'undefined';
    }
    getColorScheme() {
        const schemes = [];
        if (window.matchMedia('(prefers-color-scheme: dark)').matches)
            schemes.push('dark');
        if (window.matchMedia('(prefers-color-scheme: light)').matches)
            schemes.push('light');
        return schemes;
    }
    getStrengthScore() {
        return {
            score: 8,
            details: ['Screen characteristics available']
        };
    }
}
exports.ScreenFingerprint = ScreenFingerprint;
