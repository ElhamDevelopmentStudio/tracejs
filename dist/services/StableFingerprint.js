"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StableFingerprint = void 0;
const BaseFingerprint_1 = require("./BaseFingerprint");
class StableFingerprint extends BaseFingerprint_1.BaseFingerprint {
    async getCharacteristics() {
        try {
            const stableData = {
                // Browser/OS specific - doesn't change during session
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                hardwareConcurrency: navigator.hardwareConcurrency,
                deviceMemory: navigator.deviceMemory,
                // Timezone - stable during session
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                // Hardware capabilities - stable
                touchPoints: navigator.maxTouchPoints,
                // Screen properties that don't change with multiple monitors
                colorDepth: window.screen.colorDepth,
                pixelDepth: window.screen.pixelDepth,
                devicePixelRatio: window.devicePixelRatio,
                // WebGL information - hardware specific
                ...await this.getWebGLInfo(),
                // Audio capabilities - hardware specific
                ...await this.getAudioInfo(),
                // Canvas fingerprint - based on hardware rendering
                ...await this.getCanvasInfo()
            };
            return stableData;
        }
        catch (e) {
            console.error('Stable fingerprinting failed:', e);
            return {};
        }
    }
    async getWebGLInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    return {
                        gpuVendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                        gpuRenderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
                    };
                }
            }
        }
        catch (e) {
            console.error('WebGL fingerprinting failed:', e);
        }
        return {};
    }
    async getAudioInfo() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const sampleRate = audioContext.sampleRate;
            audioContext.close();
            return {
                audio: sampleRate.toString()
            };
        }
        catch (e) {
            console.error('Audio fingerprinting failed:', e);
            return {};
        }
    }
    async getCanvasInfo() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return {};
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
        }
        catch (e) {
            console.error('Canvas fingerprinting failed:', e);
            return {};
        }
    }
    getStrengthScore() {
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
exports.StableFingerprint = StableFingerprint;
