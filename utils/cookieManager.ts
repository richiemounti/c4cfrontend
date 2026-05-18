// utils/cookieManager.ts

import { useState, useEffect } from "react";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functionality: boolean;
  targeting: boolean;
  timestamp?: number;
}

export class CookieManager {
  private static readonly CONSENT_KEY = 'cookie-consent';
  private static readonly CONSENT_VERSION = '1.0';

  /**
   * Check if user has given cookie consent
   */
  static hasConsent(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const consent = localStorage.getItem(this.CONSENT_KEY);
      return consent !== null;
    } catch (error) {
      console.error('Error checking cookie consent:', error);
      return false;
    }
  }

  /**
   * Get current cookie preferences
   */
  static getPreferences(): CookiePreferences | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const consent = localStorage.getItem(this.CONSENT_KEY);
      if (!consent) return null;
      
      return JSON.parse(consent);
    } catch (error) {
      console.error('Error getting cookie preferences:', error);
      return null;
    }
  }

  /**
   * Save cookie preferences
   */
  static savePreferences(preferences: CookiePreferences): void {
    if (typeof window === 'undefined') return;
    
    try {
      const preferencesWithTimestamp = {
        ...preferences,
        timestamp: Date.now(),
        version: this.CONSENT_VERSION
      };
      
      localStorage.setItem(this.CONSENT_KEY, JSON.stringify(preferencesWithTimestamp));
      
      // Apply the preferences immediately
      this.applyPreferences(preferences);
      
      // Trigger custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('cookiePreferencesUpdated', {
        detail: preferences
      }));
      
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
    }
  }

  /**
   * Clear all cookie preferences (for testing/reset)
   */
  static clearPreferences(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.CONSENT_KEY);
      
      // Reset all non-necessary cookies
      this.applyPreferences({
        necessary: true,
        analytics: false,
        functionality: false,
        targeting: false
      });
      
      window.dispatchEvent(new CustomEvent('cookiePreferencesCleared'));
    } catch (error) {
      console.error('Error clearing cookie preferences:', error);
    }
  }

  /**
   * Apply cookie preferences to third-party services
   */
  private static applyPreferences(preferences: CookiePreferences): void {
    // Google Analytics/Google Tag Manager
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: preferences.analytics ? 'granted' : 'denied',
        ad_storage: preferences.targeting ? 'granted' : 'denied',
        functionality_storage: preferences.functionality ? 'granted' : 'denied',
        personalization_storage: preferences.targeting ? 'granted' : 'denied',
        security_storage: 'granted' // Always granted for necessary cookies
      });
    }

    // Facebook Pixel (if using)
    if (preferences.targeting && typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('consent', 'grant');
    } else if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('consent', 'revoke');
    }

    // Other third-party services can be added here
    // Example: Chat widgets, marketing tools, etc.
    
    console.log('Cookie preferences applied:', preferences);
  }

  /**
   * Check if specific cookie category is allowed
   */
  static isCategoryAllowed(category: keyof CookiePreferences): boolean {
    const preferences = this.getPreferences();
    if (!preferences) return false;
    
    return preferences[category] === true;
  }

  /**
   * Get cookie consent status for display
   */
  static getConsentStatus(): {
    hasConsent: boolean;
    preferences: CookiePreferences | null;
    consentDate: Date | null;
  } {
    const hasConsent = this.hasConsent();
    const preferences = this.getPreferences();
    
    let consentDate = null;
    if (preferences && (preferences as any).timestamp) {
      consentDate = new Date((preferences as any).timestamp);
    }
    
    return {
      hasConsent,
      preferences,
      consentDate
    };
  }

  /**
   * Check if consent is expired (optional feature)
   */
  static isConsentExpired(maxAgeMonths: number = 12): boolean {
    const preferences = this.getPreferences();
    if (!preferences || !(preferences as any).timestamp) return true;
    
    const consentAge = Date.now() - (preferences as any).timestamp;
    const maxAge = maxAgeMonths * 30 * 24 * 60 * 60 * 1000; // Convert months to milliseconds
    
    return consentAge > maxAge;
  }
}

// React hook for using cookie preferences
export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Initial load
    const currentPreferences = CookieManager.getPreferences();
    const currentConsent = CookieManager.hasConsent();
    
    setPreferences(currentPreferences);
    setHasConsent(currentConsent);

    // Listen for preference updates
    const handlePreferencesUpdated = (event: CustomEvent<CookiePreferences>) => {
      setPreferences(event.detail);
      setHasConsent(true);
    };

    const handlePreferencesCleared = () => {
      setPreferences(null);
      setHasConsent(false);
    };

    window.addEventListener('cookiePreferencesUpdated', handlePreferencesUpdated as EventListener);
    window.addEventListener('cookiePreferencesCleared', handlePreferencesCleared);

    return () => {
      window.removeEventListener('cookiePreferencesUpdated', handlePreferencesUpdated as EventListener);
      window.removeEventListener('cookiePreferencesCleared', handlePreferencesCleared);
    };
  }, []);

  const updatePreferences = (newPreferences: CookiePreferences) => {
    CookieManager.savePreferences(newPreferences);
  };

  const clearPreferences = () => {
    CookieManager.clearPreferences();
  };

  return {
    preferences,
    hasConsent,
    updatePreferences,
    clearPreferences,
    isCategoryAllowed: CookieManager.isCategoryAllowed
  };
}

// Google Analytics setup with consent mode
export function initializeGoogleAnalytics(gtagId: string) {
  if (typeof window === 'undefined') return;

  // Load Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
  document.head.appendChild(script);

  // Initialize gtag
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  (window as any).gtag = gtag;

  gtag('js', new Date());

  // Set default consent state
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted'
  });

  gtag('config', gtagId);

  // Apply existing consent if available
  const preferences = CookieManager.getPreferences();
  if (preferences) {
    gtag('consent', 'update', {
      analytics_storage: preferences.analytics ? 'granted' : 'denied',
      ad_storage: preferences.targeting ? 'granted' : 'denied',
      functionality_storage: preferences.functionality ? 'granted' : 'denied',
      personalization_storage: preferences.targeting ? 'granted' : 'denied'
    });
  }
}