"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatteryFingerprint = void 0;
const BaseFingerprint_1 = require("./BaseFingerprint");
class BatteryFingerprint extends BaseFingerprint_1.BaseFingerprint {
    async getCharacteristics() {
        try {
            if ('getBattery' in navigator) {
                const battery = await navigator.getBattery();
                return {
                    battery: JSON.stringify({
                        charging: battery.charging,
                        level: battery.level,
                        chargingTime: battery.chargingTime,
                        dischargingTime: battery.dischargingTime
                    })
                };
            }
        }
        catch (e) {
            console.error('Battery fingerprinting failed:', e);
        }
        return {};
    }
    getStrengthScore() {
        return {
            score: 10,
            details: ['Battery information available']
        };
    }
}
exports.BatteryFingerprint = BatteryFingerprint;
