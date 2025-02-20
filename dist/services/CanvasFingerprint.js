"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasFingerprint = void 0;
const BaseFingerprint_1 = require("./BaseFingerprint");
class CanvasFingerprint extends BaseFingerprint_1.BaseFingerprint {
    async getCharacteristics() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return {};
            // Create a complex drawing that will vary based on the GPU and browser
            canvas.width = 320;
            canvas.height = 200;
            // Background
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Draw various shapes with different styles
            // Arc
            ctx.beginPath();
            ctx.arc(100, 100, 50, 0, Math.PI * 2, true);
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Bezier curve
            ctx.beginPath();
            ctx.moveTo(50, 150);
            ctx.bezierCurveTo(150, 50, 200, 150, 300, 50);
            ctx.strokeStyle = '#28a745';
            ctx.lineWidth = 3;
            ctx.stroke();
            // Text with different fonts and effects
            ctx.textBaseline = 'top';
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#dc3545';
            ctx.fillText('TraceJS', 120, 80);
            ctx.font = 'italic 14px Times New Roman';
            ctx.fillStyle = 'rgba(108, 117, 125, 0.8)';
            ctx.fillText('Fingerprint', 130, 100);
            // Gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#ffc107');
            gradient.addColorStop(1, '#17a2b8');
            ctx.fillStyle = gradient;
            ctx.fillRect(50, 25, 220, 20);
            // Shadows
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = '#6c757d';
            ctx.fillRect(80, 150, 160, 30);
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
            score: 9,
            details: [
                'Canvas rendering available',
                'Complex shapes and gradients supported',
                'Text rendering capabilities',
                'Shadow effects supported'
            ]
        };
    }
}
exports.CanvasFingerprint = CanvasFingerprint;
