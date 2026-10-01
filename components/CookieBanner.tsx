// components/CookieBanner.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Settings, Shield, Eye, Target, Wrench } from 'lucide-react';
import Link from 'next/link';
import { CookieManager, type CookiePreferences } from '@/utils/cookieManager';

interface CookieBannerProps {
  onClose?: () => void;
}

const CookieBanner = ({ onClose }: CookieBannerProps) => {
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    functionality: false,
    targeting: false,
  });

  // The parent (app/page.tsx) decides when this is mounted — on first
  // visit, when consent has expired, or when the footer's "Cookie
  // Settings" link asks to reopen it. Load any existing choice so the
  // preferences panel reflects it, rather than re-deciding visibility
  // here too (that duplicated, and drifted out of sync with, the
  // parent's own CookieManager-driven logic).
  useEffect(() => {
    const existingPreferences = CookieManager.getPreferences();
    if (existingPreferences) {
      setPreferences(existingPreferences);
    }
  }, []);

  // Expose a reset hook for testing/debugging, routed through
  // CookieManager so it dispatches the same event the rest of the app
  // relies on (which also reopens this banner).
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).resetCookiePreferences = () => CookieManager.clearPreferences();
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      functionality: true,
      targeting: true,
    };
    setPreferences(allAccepted);
    CookieManager.savePreferences(allAccepted);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      functionality: false,
      targeting: false,
    };
    setPreferences(necessaryOnly);
    CookieManager.savePreferences(necessaryOnly);
  };

  const handleSavePreferences = () => {
    CookieManager.savePreferences(preferences);
    setShowPreferences(false);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm" />

      {/* Cookie Banner */}
      <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 md:max-w-2xl z-50">
        <div className="bg-white rounded-lg border border-c4c-rule overflow-hidden">

          {/* Header */}
          <div className="bg-c4c-petrol text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cookie className="h-6 w-6" />
                <h2 className="text-lg font-semibold">Cookie Preferences</h2>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-c4c-grey-bg transition-colors"
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
                <p className="text-c4c-petrol mb-4 leading-relaxed">
                  We use cookies to ensure our platform works correctly, understand how it is used, and improve your experience. Some cookies are essential for core functionality, while others help us analyse site usage and tailor content for project teams and partners.

                  <br/>By clicking "Accept All," you consent to the use of all cookies. You can manage your preferences or reject non-essential cookies at any time.
                </p>

                <div className="flex items-center gap-2 mb-4 text-sm text-c4c-petrol">
                  <Shield className="h-4 w-4" />
                  <span>We respect your privacy and follow GDPR guidelines</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="bg-c4c-coral text-black px-6 py-2 rounded-lg hover:bg-c4c-petrol hover:text-white transition-colors font-medium flex-1"
                  >
                    Accept All Cookies
                  </button>

                  <button
                    onClick={handleAcceptNecessary}
                    className="border border-c4c-rule text-c4c-petrol px-6 py-2 rounded-lg hover:bg-c4c-grey-bg transition-colors font-medium flex-1"
                  >
                    Necessary Only
                  </button>

                  <button
                    onClick={() => setShowPreferences(true)}
                    className="border border-c4c-rule text-black px-6 py-2 rounded-lg hover:border-black transition-colors font-medium flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Customize
                  </button>
                </div>

                <div className="mt-4 text-sm text-c4c-petrol text-center">
                  Read our{' '}
                  <Link href="/privacy" className="text-black hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  for more information.
                </div>
              </div>
            ) : (
              // Cookie Preferences Detail
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-2">Manage Cookie Preferences</h3>
                  <p className="text-c4c-petrol text-sm">
                    Choose which cookies you want to allow. You can change these settings at any time.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Necessary Cookies */}
                  <div className="border border-c4c-rule rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-c4c-petrol" />
                        <h4 className="font-semibold text-black">Necessary Cookies</h4>
                        <span className="bg-c4c-grey-bg text-c4c-petrol text-xs px-2 py-1 rounded-full">Required</span>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={preferences.necessary}
                          disabled
                          className="w-5 h-5 text-c4c-petrol bg-c4c-grey-bg border-c4c-rule rounded focus:ring-c4c-petrol cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-c4c-petrol">
                      Essential for website functionality, security, and basic features. Cannot be disabled.
                    </p>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border border-c4c-rule rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-c4c-cobalt" />
                        <h4 className="font-semibold text-black">Analytics Cookies</h4>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                          className="w-5 h-5 text-c4c-cobalt bg-c4c-grey-bg border-c4c-rule rounded focus:ring-c4c-cobalt"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-c4c-petrol">
                      Help us understand how visitors interact with our website by collecting anonymous information.
                    </p>
                  </div>

                  {/* Functionality Cookies */}
                  <div className="border border-c4c-rule rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-c4c-petrol" />
                        <h4 className="font-semibold text-black">Functionality Cookies</h4>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={preferences.functionality}
                          onChange={(e) => handlePreferenceChange('functionality', e.target.checked)}
                          className="w-5 h-5 text-c4c-petrol bg-c4c-grey-bg border-c4c-rule rounded focus:ring-c4c-petrol"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-c4c-petrol">
                      Enable enhanced features like personalized content, chat widgets, and remembering your preferences.
                    </p>
                  </div>

                  {/* Targeting Cookies */}
                  <div className="border border-c4c-rule rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-c4c-petrol" />
                        <h4 className="font-semibold text-black">Targeting Cookies</h4>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={preferences.targeting}
                          onChange={(e) => handlePreferenceChange('targeting', e.target.checked)}
                          className="w-5 h-5 text-c4c-petrol bg-c4c-grey-bg border-c4c-rule rounded focus:ring-c4c-petrol"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-c4c-petrol">
                      Used to deliver relevant advertisements and marketing content based on your interests.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-c4c-rule">
                  <button
                    onClick={handleSavePreferences}
                    className="bg-c4c-coral text-black px-6 py-2 rounded-lg hover:bg-c4c-petrol hover:text-white transition-colors font-medium flex-1"
                  >
                    Save Preferences
                  </button>

                  <button
                    onClick={() => setShowPreferences(false)}
                    className="border border-c4c-rule text-c4c-petrol px-6 py-2 rounded-lg hover:bg-c4c-grey-bg transition-colors font-medium"
                  >
                    Back
                  </button>
                </div>

                <div className="mt-3 text-xs text-c4c-petrol text-center">
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
