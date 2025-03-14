import {
  ConsentCategory,
  ConsentOptions,
  ConsentRegion,
  ConsentState,
} from "../interfaces/ConsentOptions";

/**
 * Service for managing user consent for various fingerprinting methods
 * in compliance with privacy regulations like GDPR, CCPA, etc.
 */
export class ConsentManager {
  private options: ConsentOptions;
  private consentState: ConsentState;
  private initialized = false;
  private STORAGE_KEY = "tracejs_consent";

  constructor(options: ConsentOptions = {}) {
    this.options = {
      requireExplicitConsent: {
        gdpr: true,
        lgpd: true,
        pipl: true,
        pdpa: true,
        cdpa: true,
        ctdpa: true,
        ccpa: false,
        global: false,
      },
      requiredCategories: ["essential"],
      categoryMapping: {
        battery: "functionality",
        screen: "functionality",
        canvas: "analytics",
        audio: "analytics",
        behavior: "personalization",
        geolocation: "personalization",
      },
      autoDetectRegion: true,
      defaultRegion: "global",
      persistConsent: true,
      consentExpiresDays: 365,
      ...options,
    };

    // Initialize default state
    this.consentState = {
      essential: true,
      functionality: false,
      analytics: false,
      advertising: false,
      personalization: false,
      lastUpdated: Date.now(),
      region: this.options.defaultRegion || "global",
    };
  }

  /**
   * Initialize the consent manager
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    // 1. Try to load saved consent
    if (this.options.persistConsent) {
      this.loadSavedConsent();
    }

    // 2. Detect user's region if enabled
    if (this.options.autoDetectRegion) {
      this.consentState.region = await this.detectRegion();
    }

    // 3. Apply default consent based on region
    this.applyRegionalDefaults();

    this.initialized = true;
  }

  /**
   * Check if a specific fingerprinting method has consent
   * @param method The fingerprinting method to check
   * @returns Whether the method has consent
   */
  public hasConsent(method: string): boolean {
    if (!this.initialized) {
      // Auto-initialize with defaults
      this.initialized = true;
      this.applyRegionalDefaults();
    }

    // Required categories always have consent
    const category = this.options.categoryMapping?.[method];
    if (!category) return true; // No category mapping means no consent required

    if (this.options.requiredCategories?.includes(category)) {
      return true;
    }

    return this.consentState[category] === true;
  }

  /**
   * Update consent for a specific category
   * @param category The category to update
   * @param granted Whether consent is granted
   */
  public updateConsent(category: ConsentCategory, granted: boolean): void {
    if (this.options.requiredCategories?.includes(category) && !granted) {
      // Cannot revoke consent for required categories
      return;
    }

    this.consentState[category] = granted;
    this.consentState.lastUpdated = Date.now();

    // Save the updated state
    if (this.options.persistConsent) {
      this.saveConsent();
    }

    // Trigger callback if defined
    if (this.options.onConsentChange) {
      const categories: Record<ConsentCategory, boolean> = {
        essential: this.consentState.essential,
        functionality: this.consentState.functionality,
        analytics: this.consentState.analytics,
        advertising: this.consentState.advertising,
        personalization: this.consentState.personalization,
      };

      this.options.onConsentChange(categories);
    }
  }

  /**
   * Update consent for multiple categories at once
   * @param categories Map of categories to consent values
   */
  public updateMultipleConsent(
    categories: Partial<Record<ConsentCategory, boolean>>
  ): void {
    let changed = false;

    for (const [category, granted] of Object.entries(categories) as [
      ConsentCategory,
      boolean
    ][]) {
      if (this.options.requiredCategories?.includes(category) && !granted) {
        // Skip required categories
        continue;
      }

      if (this.consentState[category] !== granted) {
        this.consentState[category] = granted;
        changed = true;
      }
    }

    if (changed) {
      this.consentState.lastUpdated = Date.now();

      // Save the updated state
      if (this.options.persistConsent) {
        this.saveConsent();
      }

      // Trigger callback if defined
      if (this.options.onConsentChange) {
        const allCategories: Record<ConsentCategory, boolean> = {
          essential: this.consentState.essential,
          functionality: this.consentState.functionality,
          analytics: this.consentState.analytics,
          advertising: this.consentState.advertising,
          personalization: this.consentState.personalization,
        };

        this.options.onConsentChange(allCategories);
      }
    }
  }

  /**
   * Get the current consent state
   * @returns The current consent state
   */
  public getConsentState(): ConsentState {
    return { ...this.consentState };
  }

  /**
   * Check if consent is expired and needs renewal
   * @returns Whether consent needs renewal
   */
  public needsConsentRenewal(): boolean {
    if (!this.options.consentExpiresDays) return false;

    const expiryMs = this.options.consentExpiresDays * 24 * 60 * 60 * 1000;
    const expiryDate = this.consentState.lastUpdated + expiryMs;

    return Date.now() > expiryDate;
  }

  /**
   * Reset consent to default values
   */
  public resetConsent(): void {
    this.consentState = {
      essential: true,
      functionality: false,
      analytics: false,
      advertising: false,
      personalization: false,
      lastUpdated: Date.now(),
      region: this.consentState.region,
    };

    this.applyRegionalDefaults();

    if (this.options.persistConsent) {
      this.saveConsent();
    }

    // Trigger callback if defined
    if (this.options.onConsentChange) {
      const categories: Record<ConsentCategory, boolean> = {
        essential: this.consentState.essential,
        functionality: this.consentState.functionality,
        analytics: this.consentState.analytics,
        advertising: this.consentState.advertising,
        personalization: this.consentState.personalization,
      };

      this.options.onConsentChange(categories);
    }
  }

  /**
   * Load saved consent from localStorage
   */
  private loadSavedConsent(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ConsentState;
        // Only update if it's a valid consent state
        if (
          typeof parsed === "object" &&
          typeof parsed.lastUpdated === "number" &&
          typeof parsed.region === "string"
        ) {
          this.consentState = {
            essential: parsed.essential === false ? false : true, // Essential defaults to true
            functionality: !!parsed.functionality,
            analytics: !!parsed.analytics,
            advertising: !!parsed.advertising,
            personalization: !!parsed.personalization,
            lastUpdated: parsed.lastUpdated,
            region: parsed.region as ConsentRegion,
          };
        }
      }
    } catch (e) {
      console.error("Error loading saved consent:", e);
    }
  }

  /**
   * Save consent to localStorage
   */
  private saveConsent(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.consentState));
    } catch (e) {
      console.error("Error saving consent:", e);
    }
  }

  /**
   * Apply default consent values based on the region
   */
  private applyRegionalDefaults(): void {
    // Apply required categories
    this.options.requiredCategories?.forEach((category) => {
      this.consentState[category] = true;
    });

    // For regions with explicit consent required, all non-required categories default to false
    let requiresExplicitConsent: boolean;

    if (typeof this.options.requireExplicitConsent === "boolean") {
      requiresExplicitConsent = this.options.requireExplicitConsent;
    } else {
      requiresExplicitConsent =
        this.options.requireExplicitConsent?.[this.consentState.region] ??
        false;
    }

    if (requiresExplicitConsent) {
      // Make sure non-required categories default to false
      const allCategories: ConsentCategory[] = [
        "essential",
        "functionality",
        "analytics",
        "advertising",
        "personalization",
      ];

      allCategories.forEach((category) => {
        if (!this.options.requiredCategories?.includes(category)) {
          this.consentState[category] = false;
        }
      });
    }
  }

  /**
   * Detect the user's region based on browser locale or IP geolocation
   * @returns The detected region
   */
  private async detectRegion(): Promise<ConsentRegion> {
    // Try to detect by browser locale first
    const locale = navigator.language || navigator.userLanguage || "";

    // Map common EU country codes to GDPR
    const euCountries = [
      "at",
      "be",
      "bg",
      "hr",
      "cy",
      "cz",
      "dk",
      "ee",
      "fi",
      "fr",
      "de",
      "gr",
      "hu",
      "ie",
      "it",
      "lv",
      "lt",
      "lu",
      "mt",
      "nl",
      "pl",
      "pt",
      "ro",
      "sk",
      "si",
      "es",
      "se",
    ];

    // Extract country code from locale (e.g., "en-US" -> "us")
    const country = locale.split("-")[1]?.toLowerCase() || "";

    if (euCountries.includes(country)) {
      return "gdpr";
    }

    if (country === "br") {
      return "lgpd";
    }

    if (country === "cn") {
      return "pipl";
    }

    if (country === "th") {
      return "pdpa";
    }

    if (country === "us") {
      // Check for US state-specific laws (simplified)
      // In a real implementation you'd want more accurate geolocation
      return "ccpa"; // Default US to CCPA
    }

    // Fallback to default region
    return this.options.defaultRegion || "global";
  }
}
