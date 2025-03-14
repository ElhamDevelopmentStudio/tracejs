/**
 * Types for the Battery Status API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API
 */

export interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener(type: "chargingchange", listener: EventListener): void;
  addEventListener(type: "levelchange", listener: EventListener): void;
  addEventListener(type: "chargingtimechange", listener: EventListener): void;
  addEventListener(
    type: "dischargingtimechange",
    listener: EventListener
  ): void;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
  dispatchEvent(event: Event): boolean;
}

export interface Navigator extends globalThis.Navigator {
  getBattery(): Promise<BatteryManager>;
}

export interface BatteryData {
  charging?: boolean;
  level?: number;
  chargingTime?: number;
  dischargingTime?: number;
}
