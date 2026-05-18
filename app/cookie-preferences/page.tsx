// app/cookie-preferences/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Cookie, Shield, Eye, Target, Wrench, Save, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { CookieManager, type CookiePreferences } from '@/utils/cookieManager';

export default function CookiePreferencesPage() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    functionality: false,
    targeting: false,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [consentInfo, setConsentInfo] = useState<{
    hasConsent: boolean;
    consentDate: Date | null;
  }>({ hasConsent: false, consentDate: null });

  useEffect(() => {
    // Load existing preferences
    const existingPreferences = CookieManager.getPreferences();
    if (existingPreferences) {
      setPreferences(existingPreferences);
    }

    // Get consent information
    const status = CookieManager.getConsentStatus();
    setConsentInfo({
      hasConsent: status.hasConsent,
      consentDate: status.consentDate
    });
  }, []);

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences((prev:any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      CookieManager.savePreferences(preferences);
      setSaveSuccess(true);
      
      // Update consent info
      const status = CookieManager.getConsentStatus();
      setConsentInfo({
        hasConsent: status.hasConsent,
        consentDate: status.consentDate
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPreferences = () => {
    setPreferences({
      necessary: true,
      analytics: false,
      functionality: false,
      targeting: false,
    });
  };

  const handleClearAllCookies = () => {
    if (confirm('This will clear all your cookie preferences and you will see the cookie banner again. Continue?')) {
      CookieManager.clearPreferences();
      setPreferences({
        necessary: true,
        analytics: false,
        functionality: false,
        targeting: false,
      });
      setConsentInfo({ hasConsent: false, consentDate: null });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-stratosphere text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Cookie Preferences</h1>
            </div>
            <p className="text-sky-tint/90">
              Manage your cookie preferences and privacy settings
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Current Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${consentInfo.hasConsent ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-700">
                  {consentInfo.hasConsent ? 'Cookie preferences set' : 'No cookie preferences set'}
                </span>
              </div>
              {consentInfo.consentDate && (
                <div className="text-sm text-gray-600">
                  Last updated: {consentInfo.consentDate.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Save Success Message */}
          {saveSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
              <Save className="h-5 w-5" />
              Your cookie preferences have been saved successfully!
            </div>
          )}

          {/* Cookie Categories */}
          <div className="space-y-6">
            
            {/* Necessary Cookies */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-red-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Necessary Cookies</h3>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Always Active</span>
                  </div>
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
              <p className="text-gray-600 text-sm mb-3">
                These cookies are essential for the website to function and cannot be switched off. 
                They are usually only set in response to actions made by you which amount to a request for services.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Examples:</strong> Authentication, security, remembering your preferences, shopping cart functionality
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-blue-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Analytics Cookies</h3>
                    <span className="text-sm text-gray-600">Help us improve our website</span>
                  </div>
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
              <p className="text-gray-600 text-sm mb-3">
                These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. 
                They help us understand which pages are popular and how visitors move around the site.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Examples:</strong> Google Analytics, page view tracking, user behavior analysis
              </div>
            </div>

            {/* Functionality Cookies */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Wrench className="h-6 w-6 text-green-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Functionality Cookies</h3>
                    <span className="text-sm text-gray-600">Enhanced features and personalization</span>
                  </div>
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
              <p className="text-gray-600 text-sm mb-3">
                These cookies enable the website to provide enhanced functionality and personalization. 
                They may be set by us or by third-party providers whose services we have added to our pages.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Examples:</strong> Live chat widgets, embedded videos, social media widgets, language preferences
              </div>
            </div>

            {/* Targeting Cookies */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-purple-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Targeting Cookies</h3>
                    <span className="text-sm text-gray-600">Personalized advertising</span>
                  </div>
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
              <p className="text-gray-600 text-sm mb-3">
                These cookies may be set through our site by our advertising partners. 
                They may be used to build a profile of your interests and show you relevant adverts on other sites.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Examples:</strong> Facebook Pixel, Google Ads, retargeting campaigns, personalized content
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="bg-stratosphere text-white px-6 py-3 rounded-lg hover:bg-stratosphere/90 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Preferences
                </>
              )}
            </button>
            
            <button
              onClick={handleResetPreferences}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Reset to Defaults
            </button>
            
            <button
              onClick={handleClearAllCookies}
              className="border border-red-300 text-red-700 px-6 py-3 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Clear All Cookie Data
            </button>
          </div>

          {/* Additional Information */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Need More Information?</h3>
            <p className="text-sm text-blue-800 mb-3">
              For more details about how we use cookies and protect your privacy, please read our privacy policy.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link 
                href="/privacy" 
                className="text-blue-700 hover:text-blue-800 underline text-sm"
              >
                Read our Privacy Policy
              </Link>
              <span className="text-blue-600 text-sm">•</span>
              <Link 
                href="/" 
                className="text-blue-700 hover:text-blue-800 underline text-sm"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}