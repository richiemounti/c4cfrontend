// components/ui/CookieBanner.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Settings, Shield, Eye, Target, Wrench } from 'lucide-react';
import Link from 'next/link';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functionality: boolean;
  targeting: boolean;
}

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    functionality: false,
    targeting: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(cookieConsent);
        setPreferences(savedPreferences);
        // Apply the saved cookie preferences
        applyCookieSettings(savedPreferences);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, []);

  const applyCookieSettings = (prefs: CookiePreferences) => {
    // Apply analytics cookies (Google Analytics, etc.)
    if (prefs.analytics) {
      // Enable Google Analytics or other analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'granted'
        });
      }
    } else {
      // Disable analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'denied'
        });
      }
    }

    // Apply functionality cookies
    if (prefs.functionality) {
      // Enable functionality features like chat widgets, etc.
      console.log('Functionality cookies enabled');
    }

    // Apply targeting/advertising cookies
    if (prefs.targeting) {
      // Enable advertising/targeting cookies
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'granted'
        });
      }
    } else {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'denied'
        });
      }
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      functionality: true,
      targeting: true,
    };
    
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    applyCookieSettings(allAccepted);
    setIsVisible(false);
    
    // Track acceptance event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cookie_consent', {
        event_category: 'engagement',
        event_label: 'accept_all'
      });
    }
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      functionality: false,
      targeting: false,
    };
    
    setPreferences(necessaryOnly);
    localStorage.setItem('cookie-consent', JSON.stringify(necessaryOnly));
    applyCookieSettings(necessaryOnly);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    applyCookieSettings(preferences);
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetCookiePreferences = () => {
    localStorage.removeItem('cookie-consent');
    setPreferences({
      necessary: true,
      analytics: false,
      functionality: false,
      targeting: false,
    });
    setIsVisible(true);
    setShowPreferences(false);
  };

  // Add a function to window for testing/debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).resetCookiePreferences = resetCookiePreferences;
    }
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm" />
      
      {/* Cookie Banner */}
      <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 md:max-w-2xl z-50">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-stratosphere text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cookie className="h-6 w-6" />
                <h2 className="text-lg font-semibold">Cookie Preferences</h2>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white hover:text-sky-tint transition-colors"
                aria-label="Close cookie banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!showPreferences ? (
              // Main Cookie Notice
              <div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  We use cookies to ensure our platform works correctly, understand how it is used, and improve your experience. Some cookies are essential for core functionality, while others help us analyse site usage and tailor content for project teams and partners.

                  <br/>By clicking "Accept All," you consent to the use of all cookies. You can manage your preferences or reject non-essential cookies at any time.
                </p>
                
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>We respect your privacy and follow GDPR guidelines</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="bg-stratosphere text-white px-6 py-2 rounded-lg hover:bg-stratosphere/90 transition-colors font-medium flex-1"
                  >
                    Accept All Cookies
                  </button>
                  
                  <button
                    onClick={handleAcceptNecessary}
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium flex-1"
                  >
                    Necessary Only
                  </button>
                  
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="border border-stratosphere text-stratosphere px-6 py-2 rounded-lg hover:bg-stratosphere/10 transition-colors font-medium flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Customize
                  </button>
                </div>

                <div className="mt-4 text-sm text-gray-600 text-center">
                  Read our{' '}
                  <Link href="/privacy" className="text-stratosphere hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  for more information.
                </div>
              </div>
            ) : (
              // Cookie Preferences Detail
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Cookie Preferences</h3>
                  <p className="text-gray-600 text-sm">
                    Choose which cookies you want to allow. You can change these settings at any time.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Necessary Cookies */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-500" />
                        <h4 className="font-semibold text-gray-900">Necessary Cookies</h4>
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Required</span>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={preferences.necessary}
                          disabled
                          className="w-5 h-5 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Essential for website functionality, security, and basic features. Cannot be disabled.
                    </p>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-500" />
                        <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                          className="w-5 h-5 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Help us understand how visitors interact with our website by collecting anonymous information.
                    </p>
                  </div>

                  {/* Functionality Cookies */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-green-500" />
                        <h4 className="font-semibold text-gray-900">Functionality Cookies</h4>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={preferences.functionality}
                          onChange={(e) => handlePreferenceChange('functionality', e.target.checked)}
                          className="w-5 h-5 text-green-500 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Enable enhanced features like personalized content, chat widgets, and remembering your preferences.
                    </p>
                  </div>

                  {/* Targeting Cookies */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-500" />
                        <h4 className="font-semibold text-gray-900">Targeting Cookies</h4>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={preferences.targeting}
                          onChange={(e) => handlePreferenceChange('targeting', e.target.checked)}
                          className="w-5 h-5 text-purple-500 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Used to deliver relevant advertisements and marketing content based on your interests.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSavePreferences}
                    className="bg-stratosphere text-white px-6 py-2 rounded-lg hover:bg-stratosphere/90 transition-colors font-medium flex-1"
                  >
                    Save Preferences
                  </button>
                  
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                </div>

                <div className="mt-3 text-xs text-gray-500 text-center">
                  You can change these preferences at any time in your browser settings or by clearing your cookies.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieBanner;