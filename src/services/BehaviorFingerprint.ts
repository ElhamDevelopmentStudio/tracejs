import {
  BrowserCharacteristics,
  FingerprintStrength,
} from "../interfaces/BrowserCharacteristics";
import {
  BehaviorProfile,
  KeyboardMetrics,
  MouseMetrics,
  TouchMetrics,
} from "../types/behavior";
import { generateCacheKey, getFromCache, saveToCache } from "../utils/cache";
import { BaseFingerprint } from "./BaseFingerprint";

export interface BehaviorOptions {
  /**
   * Whether to track mouse movements and clicks
   * @default true
   */
  trackMouse?: boolean;

  /**
   * Whether to track keyboard activity
   * @default true
   */
  trackKeyboard?: boolean;

  /**
   * Whether to track touch interactions
   * @default true
   */
  trackTouch?: boolean;

  /**
   * Privacy level for data collection
   * - full: Collect all data including key values
   * - balanced: Collect data but anonymize sensitive information
   * - minimal: Collect only timing data, not content
   * @default "balanced"
   */
  privacyMode?: "full" | "balanced" | "minimal";

  /**
   * Milliseconds between data samples
   * @default 100
   */
  sampleRate?: number;

  /**
   * How long to collect data before generating a profile (milliseconds)
   * @default 10000 (10 seconds)
   */
  trainingDuration?: number;

  /**
   * Callback when the behavior profile is updated
   */
  onProfileUpdate?: (profile: BehaviorProfile) => void;
}

export class BehaviorFingerprint extends BaseFingerprint {
  private options: BehaviorOptions;
  private behaviorProfile: BehaviorProfile = {};
  private initialized = false;
  private profileReady = false;
  private mouseData: { x: number; y: number; timestamp: number }[] = [];
  private keyData: { key: string; duration: number; timestamp: number }[] = [];
  private touchData: {
    x: number;
    y: number;
    size: number;
    timestamp: number;
  }[] = [];
  private dataCollectionStartTime = 0;
  private mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private mouseClickHandler: ((e: MouseEvent) => void) | null = null;
  private keyDownHandler: ((e: KeyboardEvent) => void) | null = null;
  private keyUpHandler: ((e: KeyboardEvent) => void) | null = null;
  private touchHandler: ((e: TouchEvent) => void) | null = null;
  private keysDown: Record<string, number> = {}; // key: timestamp
  private cachedProfile: string | null = null;
  private profileTimestamp = 0;
  private readonly PROFILE_VALIDITY_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  constructor(options: BehaviorOptions = {}) {
    super();

    // Define default options as a separate object for better readability
    const defaultOptions: Required<Omit<BehaviorOptions, "onProfileUpdate">> = {
      trackMouse: true,
      trackKeyboard: true,
      trackTouch: true,
      privacyMode: "balanced",
      sampleRate: 100, // 100ms between samples by default
      trainingDuration: 10000, // 10 seconds by default
    };

    // Merge with provided options, giving preference to user-provided values
    this.options = {
      ...defaultOptions,
      ...options,
    };

    // Try to load cached profile from storage
    this.loadCachedProfile();
  }

  /**
   * Loads previously cached behavior profile from localStorage if available
   * and if it's still within the validity period
   */
  private loadCachedProfile(): void {
    try {
      const cacheKey = generateCacheKey("behavior_profile");
      const cachedProfile = getFromCache<BehaviorProfile>(cacheKey);

      if (cachedProfile) {
        this.behaviorProfile = cachedProfile;
        this.profileReady = true;
        this.cachedProfile = JSON.stringify(cachedProfile);
      }
    } catch (error) {
      console.error("Error loading cached behavior profile:", error);
      // If there's an error, we'll just collect new data
    }
  }

  /**
   * Saves the current behavior profile to localStorage for future consistency
   */
  private saveCachedProfile(): void {
    try {
      if (this.profileReady && this.behaviorProfile) {
        const cacheKey = generateCacheKey("behavior_profile");
        saveToCache(cacheKey, this.behaviorProfile);
        this.cachedProfile = JSON.stringify(this.behaviorProfile);
        this.profileTimestamp = Date.now();
      }
    } catch (error) {
      console.error("Error saving behavior profile to cache:", error);
    }
  }

  public initialize(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.dataCollectionStartTime = Date.now();

    // Set up event listeners
    if (this.options.trackMouse) {
      this.setupMouseTracking();
    }

    if (this.options.trackKeyboard) {
      this.setupKeyboardTracking();
    }

    if (this.options.trackTouch) {
      this.setupTouchTracking();
    }

    // Set up processing interval
    setTimeout(
      () => this.processCollectedData(),
      this.options.trainingDuration
    );
  }

  public cleanup(): void {
    if (!this.initialized) return;

    // Remove event listeners
    if (this.mouseMoveHandler) {
      window.removeEventListener("mousemove", this.mouseMoveHandler);
      this.mouseMoveHandler = null;
    }

    if (this.mouseClickHandler) {
      window.removeEventListener("mousedown", this.mouseClickHandler);
      this.mouseClickHandler = null;
    }

    if (this.keyDownHandler) {
      window.removeEventListener("keydown", this.keyDownHandler);
      this.keyDownHandler = null;
    }

    if (this.keyUpHandler) {
      window.removeEventListener("keyup", this.keyUpHandler);
      this.keyUpHandler = null;
    }

    if (this.touchHandler) {
      window.removeEventListener("touchstart", this.touchHandler);
      window.removeEventListener("touchmove", this.touchHandler);
      window.removeEventListener("touchend", this.touchHandler);
      this.touchHandler = null;
    }

    this.initialized = false;
  }

  private setupMouseTracking(): void {
    let lastSample = 0;

    this.mouseMoveHandler = (e: MouseEvent) => {
      const now = Date.now();
      const sampleRate = this.options.sampleRate ?? 100; // Use nullish coalescing
      if (now - lastSample < sampleRate) return;
      lastSample = now;

      this.mouseData.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: now,
      });
    };

    this.mouseClickHandler = (e: MouseEvent) => {
      // Track clicks for pressure estimation
      this.mouseData.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      });
    };

    window.addEventListener("mousemove", this.mouseMoveHandler);
    window.addEventListener("mousedown", this.mouseClickHandler);
  }

  private setupKeyboardTracking(): void {
    this.keyDownHandler = (e: KeyboardEvent) => {
      // Don't track actual key values in balanced or minimal privacy modes
      if (
        this.options.privacyMode === "balanced" ||
        this.options.privacyMode === "minimal"
      ) {
        this.keysDown[e.code] = Date.now();
      } else {
        this.keysDown[e.key] = Date.now();
      }
    };

    this.keyUpHandler = (e: KeyboardEvent) => {
      const startTime =
        this.keysDown[this.options.privacyMode === "full" ? e.key : e.code];
      if (startTime) {
        const duration = Date.now() - startTime;

        // In minimal privacy mode, only record timing data, not key identity
        const keyIdentifier =
          this.options.privacyMode === "minimal"
            ? "key"
            : this.options.privacyMode === "balanced"
            ? e.code
            : e.key;

        this.keyData.push({
          key: keyIdentifier,
          duration,
          timestamp: Date.now(),
        });

        delete this.keysDown[
          this.options.privacyMode === "full" ? e.key : e.code
        ];
      }
    };

    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
  }

  private setupTouchTracking(): void {
    let lastSample = 0;

    this.touchHandler = (e: TouchEvent) => {
      const now = Date.now();
      const sampleRate = this.options.sampleRate ?? 100; // Use nullish coalescing

      if (now - lastSample < sampleRate && e.type === "touchmove") return;
      if (e.type === "touchmove") lastSample = now;

      // Only track the first touch point for privacy reasons
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.touchData.push({
          x: touch.clientX,
          y: touch.clientY,
          size: touch.radiusX * touch.radiusY || 1, // Some browsers may not support radius
          timestamp: now,
        });
      }
    };

    window.addEventListener("touchstart", this.touchHandler);
    window.addEventListener("touchmove", this.touchHandler);
    window.addEventListener("touchend", this.touchHandler);
  }

  private calculateMouseMetrics(): MouseMetrics {
    if (this.mouseData.length < 10) return {}; // Not enough data

    const metrics: MouseMetrics = {};

    // Calculate average speed
    let totalSpeed = 0;
    let speedSamples = 0;

    for (let i = 1; i < this.mouseData.length; i++) {
      const prev = this.mouseData[i - 1];
      const curr = this.mouseData[i];

      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const timeDiff = curr.timestamp - prev.timestamp;

      if (timeDiff > 0) {
        const speed = distance / timeDiff;
        totalSpeed += speed;
        speedSamples++;
      }
    }

    metrics.averageSpeed = speedSamples > 0 ? totalSpeed / speedSamples : 0;

    // Calculate direction changes
    let directionChanges = 0;
    let prevDirection = 0; // 0 = undefined, 1 = up, 2 = down, 3 = left, 4 = right

    for (let i = 1; i < this.mouseData.length; i++) {
      const prev = this.mouseData[i - 1];
      const curr = this.mouseData[i];

      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;

      let currDirection = 0;
      if (Math.abs(dx) > Math.abs(dy)) {
        currDirection = dx > 0 ? 4 : 3;
      } else {
        currDirection = dy > 0 ? 2 : 1;
      }

      if (prevDirection !== 0 && currDirection !== prevDirection) {
        directionChanges++;
      }

      prevDirection = currDirection;
    }

    metrics.directionChanges = directionChanges;

    // Calculate hesitations (pauses in movement)
    let hesitations = 0;
    for (let i = 1; i < this.mouseData.length; i++) {
      const prev = this.mouseData[i - 1];
      const curr = this.mouseData[i];

      const timeDiff = curr.timestamp - prev.timestamp;
      if (timeDiff > 300) {
        // Pause threshold: 300ms
        hesitations++;
      }
    }

    metrics.hesitations = hesitations;

    return metrics;
  }

  private calculateKeyboardMetrics(): KeyboardMetrics {
    if (this.keyData.length < 5) return {}; // Not enough data

    const metrics: KeyboardMetrics = {};

    // Calculate average key press time
    const totalPressTimes = this.keyData.reduce(
      (sum, data) => sum + data.duration,
      0
    );
    metrics.keyPressTime = totalPressTimes / this.keyData.length;

    // Calculate typing speed
    if (this.keyData.length >= 2) {
      const timeSpan =
        this.keyData[this.keyData.length - 1].timestamp -
        this.keyData[0].timestamp;
      metrics.typingSpeed = this.keyData.length / (timeSpan / 1000); // characters per second
    }

    // In full privacy mode, analyze common errors
    if (this.options.privacyMode === "full" && this.keyData.length > 20) {
      const backspaceCount = this.keyData.filter(
        (k) => k.key === "Backspace"
      ).length;
      metrics.deletionRate = backspaceCount / this.keyData.length;
    }

    return metrics;
  }

  private calculateTouchMetrics(): TouchMetrics {
    if (this.touchData.length < 10) return {}; // Not enough data

    const metrics: TouchMetrics = {};

    // Calculate average touch size
    const totalSize = this.touchData.reduce((sum, data) => sum + data.size, 0);
    metrics.touchSize = totalSize / this.touchData.length;

    // Calculate swipe speed
    let totalSwipeSpeed = 0;
    let swipeSamples = 0;

    for (let i = 1; i < this.touchData.length; i++) {
      const prev = this.touchData[i - 1];
      const curr = this.touchData[i];

      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const timeDiff = curr.timestamp - prev.timestamp;

      if (timeDiff > 0 && timeDiff < 300) {
        // Likely part of the same swipe
        const speed = distance / timeDiff;
        totalSwipeSpeed += speed;
        swipeSamples++;
      }
    }

    if (swipeSamples > 0) {
      metrics.swipeCharacteristics = {
        speed: totalSwipeSpeed / swipeSamples,
      };
    }

    return metrics;
  }

  private processCollectedData(): void {
    if (this.profileReady) return;

    this.behaviorProfile = {
      mouse: this.options.trackMouse ? this.calculateMouseMetrics() : undefined,
      keyboard: this.options.trackKeyboard
        ? this.calculateKeyboardMetrics()
        : undefined,
      touch: this.options.trackTouch ? this.calculateTouchMetrics() : undefined,
    };

    this.profileReady = true;

    // Save profile for future consistency
    this.saveCachedProfile();

    // Notify if a callback is provided
    if (this.options.onProfileUpdate) {
      this.options.onProfileUpdate(this.behaviorProfile);
    }
  }

  async getCharacteristics(): Promise<Partial<BrowserCharacteristics>> {
    // If we already have a cached profile, use it for consistency
    if (this.cachedProfile) {
      return {
        behaviorProfile: this.cachedProfile,
      };
    }

    // Otherwise, proceed with normal initialization and collection
    if (!this.initialized) {
      this.initialize();
    }

    // If profile isn't ready yet, wait for it
    if (!this.profileReady) {
      // Calculate how much time is left
      const elapsedTime = Date.now() - this.dataCollectionStartTime;
      const trainingDuration = this.options.trainingDuration ?? 10000; // Use nullish coalescing for cleaner fallback
      const remainingTime = Math.max(0, trainingDuration - elapsedTime);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
        this.processCollectedData();
      }
    }

    // If we have a behavior profile, return it
    if (this.profileReady && this.behaviorProfile) {
      const profileStr = JSON.stringify(this.behaviorProfile);

      // Update cache if needed
      if (this.cachedProfile !== profileStr) {
        this.saveCachedProfile();
      }

      return {
        behaviorProfile: profileStr,
      };
    }

    return {};
  }

  getStrengthScore(): FingerprintStrength {
    if (!this.profileReady) {
      return {
        score: 0,
        details: ["Behavior profile not yet available"],
      };
    }

    let score = 0;
    const details: string[] = [];

    // Mouse metrics contribute up to 20 points
    if (this.behaviorProfile.mouse) {
      const mouseMetrics = Object.keys(this.behaviorProfile.mouse).length;
      const mouseScore = Math.min(20, mouseMetrics * 5);
      score += mouseScore;
      details.push(`Mouse behavior patterns (${mouseScore} points)`);
    }

    // Keyboard metrics contribute up to 20 points
    if (this.behaviorProfile.keyboard) {
      const keyboardMetrics = Object.keys(this.behaviorProfile.keyboard).length;
      const keyboardScore = Math.min(20, keyboardMetrics * 6);
      score += keyboardScore;
      details.push(`Keyboard behavior patterns (${keyboardScore} points)`);
    }

    // Touch metrics contribute up to 20 points
    if (this.behaviorProfile.touch) {
      const touchMetrics = Object.keys(this.behaviorProfile.touch).length;
      const touchScore = Math.min(20, touchMetrics * 7);
      score += touchScore;
      details.push(`Touch behavior patterns (${touchScore} points)`);
    }

    return {
      score,
      details:
        details.length > 0 ? details : ["Behavior fingerprinting enabled"],
    };
  }
}
