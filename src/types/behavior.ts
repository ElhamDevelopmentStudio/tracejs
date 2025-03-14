/**
 * Types for behavioral fingerprinting
 */

export interface MouseMetrics {
  averageSpeed?: number; // Average mouse movement speed in pixels/ms
  curveDeviation?: number; // How much the mouse path deviates from straight lines
  cornerRounding?: number; // How rounded corners are in mouse movements
  clickPressure?: number; // Simulated pressure based on click duration
  hesitations?: number; // Number of pauses during movement
  movementVariance?: number; // Variance in speed during movement
  directionChanges?: number; // How often direction changes during movement
  accelerationProfile?: number[]; // Profile of acceleration/deceleration
}

export interface KeyboardMetrics {
  typingSpeed?: number; // Average typing speed in characters/second
  typingRhythm?: number[]; // Timing patterns between keystrokes
  keyPressTime?: number; // Average time a key is held down
  doubleLetterSpeed?: number; // Speed when typing the same letter twice
  commonErrors?: string[]; // Common typing errors
  deletionRate?: number; // How often backspace is used
  keyPressForce?: number; // Simulated pressure based on key press duration
}

export interface TouchMetrics {
  touchSize?: number; // Average size of touch contact area
  touchPressure?: number; // Pressure applied during touch
  multiTouchPatterns?: number[]; // Patterns in multi-touch gestures
  swipeCharacteristics?: {
    // Characteristics of swipe gestures
    speed?: number;
    straightness?: number;
    consistency?: number;
  };
  tapSpeed?: number; // Speed of tap gestures
  pinchCharacteristics?: {
    // Characteristics of pinch gestures
    speed?: number;
    symmetry?: number;
  };
}

export interface BehaviorProfile {
  mouse?: MouseMetrics;
  keyboard?: KeyboardMetrics;
  touch?: TouchMetrics;
  interactionPatterns?: {
    timeOfDay?: number[]; // When the user typically interacts
    sessionDuration?: number; // Average session duration
    interactionDensity?: number; // Number of interactions per minute
    navigationPatterns?: string[]; // Common navigation sequences
  };
}
