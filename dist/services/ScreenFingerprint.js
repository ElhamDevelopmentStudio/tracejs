"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenFingerprint = void 0;
const environment_1 = require("../utils/environment");
const BaseFingerprint_1 = require("./BaseFingerprint");
class ScreenFingerprint extends BaseFingerprint_1.BaseFingerprint {
    async getCharacteristics() {
        try {
            const win = (0, environment_1.getGlobalWindow)();
            if (!win || !win.screen) {
                return {};
            }
            // Get only primary screen characteristics that don't change with multiple monitors
            const screenData = {
                // Color depth is typically consistent across monitors
                colorDepth: win.screen.colorDepth,
                // Use pixelDepth as it's usually consistent
                pixelDepth: win.screen.pixelDepth,
                // Device pixel ratio is browser/OS specific, not monitor specific
                devicePixelRatio: win.devicePixelRatio ?? 1,
                // Check if device orientation is available (mobile devices)
                orientationType: win.screen.orientation?.type || 'undefined',
                // Check color gamut support - this is device/browser specific, not monitor specific
                colorGamut: this.getColorGamut(win),
                // Get supported color schemes
                colorScheme: this.getColorScheme(win),
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
    getColorGamut(win) {
        // Check color gamut support using CSS media queries
        if (win.matchMedia) {
            if (win.matchMedia("(color-gamut: rec2020)")?.matches)
                return "rec2020";
            if (win.matchMedia("(color-gamut: p3)")?.matches)
                return "p3";
            if (win.matchMedia("(color-gamut: srgb)")?.matches)
                return "srgb";
        }
        return 'undefined';
    }
    getColorScheme(win) {
        const schemes = [];
        if (win.matchMedia) {
            if (win.matchMedia("(prefers-color-scheme: dark)")?.matches)
                schemes.push("dark");
            if (win.matchMedia("(prefers-color-scheme: light)")?.matches)
                schemes.push("light");
        }
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
