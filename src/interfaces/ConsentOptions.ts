/**
 * Configuration for consent management
 */

export type ConsentCategory =
  | "essential"
  | "functionality"
  | "analytics"
  | "advertising"
  | "personalization";

export type ConsentRegion =
  | "gdpr" // European Union (GDPR)
  | "ccpa" // California (CCPA/CPRA)
  | "lgpd" // Brazil
  | "pipl" // China
  | "pdpa" // Thailand
  | "cdpa" // Virginia (USA)
  | "ctdpa" // Connecticut (USA)
  | "global"; // Apply to all regions

export interface ConsentOptions {
  /**
   * Whether consent is required by default (true) or opt-out (false)
   * Default: true for GDPR regions, false for others
   */
  requireExplicitConsent?: boolean | Record<ConsentRegion, boolean>;

  /**
   * Categories that are always allowed, regardless of user consent
   * Default: ['essential']
   */
  requiredCategories?: ConsentCategory[];

  /**
   * Categories of data collection that require consent
   * Map each fingerprinting method to a consent category
   */
  categoryMapping?: {
    battery?: ConsentCategory;
    screen?: ConsentCategory;
    canvas?: ConsentCategory;
    audio?: ConsentCategory;
    behavior?: ConsentCategory;
    geolocation?: ConsentCategory;
    [key: string]: ConsentCategory | undefined;
  };

  /**
   * Auto-detect user's region based on IP or browser locale
   * Default: true
   */
  autoDetectRegion?: boolean;

  /**
   * Default region to use when autoDetectRegion is false
   * Default: 'global'
   */
  defaultRegion?: ConsentRegion;

  /**
   * Store consent preferences in localStorage
   * Default: true
   */
  persistConsent?: boolean;

  /**
   * Days until consent expires and needs renewal
   * Default: 365
   */
  consentExpiresDays?: number;

  /**
   * Callback when consent status changes
   */
  onConsentChange?: (categories: Record<ConsentCategory, boolean>) => void;
}

export interface ConsentState {
  essential: boolean;
  functionality: boolean;
  analytics: boolean;
  advertising: boolean;
  personalization: boolean;
  lastUpdated: number;
  region: ConsentRegion;
}
