// app/privacy/page.tsx

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Mail, Phone, MapPin, Shield, Eye, Lock, Users, Cookie, Globe, AlertTriangle, FileText, UserCheck, ExternalLink, RefreshCw } from 'lucide-react';
export default function PrivacyPolicyPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isExpanded = (sectionId: string) => expandedSections.includes(sectionId);

  const lastUpdated = "08 July 2025";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-stratosphere text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Privacy & Cookies Policy</h1>
            </div>
            <p className="text-xl text-sky-tint/90">
              We respect your privacy and are committed to protecting your personal data
            </p>
            <p className="text-sm text-sky-tint/70 mt-2">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Quick Contact */}
          <div className="bg-white rounded-lg shadow-sm border border-sky/20 p-6 mb-8">
            <h2 className="text-xl font-semibold text-stratosphere mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Data Protection Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-stratosphere mt-1" />
                <div>
                  <p className="font-medium">Email us for privacy matters:</p>
                  <a href="mailto:privacy@connectgo.co.uk" className="text-stratosphere hover:underline">
                    privacy@connectgo.co.uk
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-stratosphere mt-1" />
                <div>
                  <p className="font-medium">Registered Office:</p>
                  <p className="text-gray-600">
                    8b Nevill Terrace, Tunbridge Wells<br />
                    Kent, England, TN2 5QY
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>ICO Registration:</strong> ZB051746 | 
                <strong> Company No:</strong> 11200005 | 
                We comply with GDPR and Data Protection Act 2018
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-white rounded-lg shadow-sm border border-sky/20 p-6 mb-8">
            <h2 className="text-xl font-semibold text-stratosphere mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <a href="#introduction" className="text-stratosphere hover:underline py-1">1. Introduction</a>
              <a href="#data-collection" className="text-stratosphere hover:underline py-1">2. Data We Collect</a>
              <a href="#how-collected" className="text-stratosphere hover:underline py-1">3. How Data is Collected</a>
              <a href="#how-we-use" className="text-stratosphere hover:underline py-1">4. How We Use Your Data</a>
              <a href="#purposes" className="text-stratosphere hover:underline py-1">5. Purposes for Processing</a>
              <a href="#marketing" className="text-stratosphere hover:underline py-1">6. Direct Marketing</a>
              <a href="#third-party-marketing" className="text-stratosphere hover:underline py-1">7. Third Party Marketing</a>
              <a href="#opt-out" className="text-stratosphere hover:underline py-1">8. Opting Out</a>
              <a href="#cookies" className="text-stratosphere hover:underline py-1">9. Cookies</a>
              <a href="#disclosures" className="text-stratosphere hover:underline py-1">10. Data Disclosures</a>
              <a href="#security" className="text-stratosphere hover:underline py-1">11. Data Security</a>
              <a href="#transfers" className="text-stratosphere hover:underline py-1">12. International Transfers</a>
              <a href="#retention" className="text-stratosphere hover:underline py-1">13. Data Retention</a>
              <a href="#your-rights" className="text-stratosphere hover:underline py-1">14. Your Rights</a>
              <a href="#third-party-links" className="text-stratosphere hover:underline py-1">15. Third Party Links</a>
              <a href="#changes" className="text-stratosphere hover:underline py-1">16. Policy Changes</a>
            </div>
          </div>

          {/* Privacy Sections */}
          <div className="space-y-6">

            {/* Section 1: Introduction */}
            <section id="introduction" className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('introduction')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">1. Introduction</h2>
                </div>
                {isExpanded('introduction') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('introduction') && (
                <div className="px-6 pb-6">
                  <div className="prose prose-gray max-w-none">
                    <p className="mb-4">
                      We are <strong>ConnectGo Ltd</strong>, a company registered in England and Wales under company no. 11200005 
                      of registered office address 8b Nevill Terrace, Tunbridge Wells, Kent, England, TN2 5QY. 
                      We are the controller responsible for your personal data.
                    </p>
                    <p className="mb-4">
                      By creating an account, you agree to this privacy and cookies policy.
                    </p>
                    <p className="mb-4">
                      We comply with our obligations under the Data Protection Act 2018 and the EU law retained version 
                      of the General Data Protection Regulation (GDPR).
                    </p>
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p className="text-sm">
                        <strong>This policy explains how we collect and process your personal data when you:</strong>
                      </p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Visit our website at https://www.connectgo.co.uk/</li>
                        <li>• Subscribe to our newsletter</li>
                        <li>• Use our platform via distributors' websites</li>
                        <li>• Register and create an account</li>
                        <li>• Contact us with enquiries</li>
                        <li>• Purchase goods or services from us</li>
                        <li>• Participate in surveys</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Section 2: Data We Collect */}
            <section id="data-collection" className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('data-collection')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">2. The Data We May Collect About You</h2>
                </div>
                {isExpanded('data-collection') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('data-collection') && (
                <div className="px-6 pb-6">
                  <p className="mb-6">
                    Personal data means any information about an individual from which that person can be identified. 
                    We may collect, use, store and transfer different kinds of personal data about you:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-stratosphere mb-2">Identity Data</h3>
                      <p className="text-sm text-gray-600">Full name, marital status, title, date of birth, and gender</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-stratosphere mb-2">Contact Data</h3>
                      <p className="text-sm text-gray-600">Home address, billing address, email address and telephone number</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-stratosphere mb-2">Financial Data</h3>
                      <p className="text-sm text-gray-600">Bank account and payment card details</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-stratosphere mb-2">Transaction Data</h3>
                      <p className="text-sm text-gray-600">Details about payments and purchases</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-stratosphere mb-2">Technical Data</h3>
                      <p className="text-sm text-gray-600">IP address, login data, browser type, operating system</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-stratosphere mb-2">Profile Data</h3>
                      <p className="text-sm text-gray-600">Username, preferences, feedback, and survey responses</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-stratosphere mb-2">Usage Data</h3>
                      <p className="text-sm text-gray-600">Information about how you use our website and services</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-stratosphere mb-2">Marketing Data</h3>
                      <p className="text-sm text-gray-600">Your marketing preferences and communication preferences</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Section 3: How Data is Collected */}
            <section id="how-collected" className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('how-collected')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">3. How Is Your Personal Data Collected?</h2>
                </div>
                {isExpanded('how-collected') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('how-collected') && (
                <div className="px-6 pb-6">
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-stratosphere mb-2">Direct Interactions</h3>
                      <p className="text-gray-600">
                        You may give us your data by filling in forms or by corresponding with us by post, phone, email, 
                        social media, or through our platform distributors.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-stratosphere mb-2">Automated Technologies</h3>
                      <p className="text-gray-600">
                        We automatically collect Technical Data about your equipment, browsing actions and patterns 
                        using cookies, server logs and similar technologies.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h3 className="font-semibold text-stratosphere mb-2">Public Sources</h3>
                      <p className="text-gray-600">
                        We may collect personal data from public sources such as Google, Companies House, or electoral registers.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Section 4: How We Use Your Data */}
            <section id="how-we-use" className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('how-we-use')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">4. How We Use Your Personal Data</h2>
                </div>
                {isExpanded('how-we-use') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('how-we-use') && (
                <div className="px-6 pb-6">
                  <p className="mb-4">
                    We will only use your personal data when we can rely on a legitimate (lawful) basis:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Contract</h3>
                      <p className="text-sm text-blue-700">
                        Where we need to perform the contract we are about to enter into or have entered into with you.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Legitimate Interests</h3>
                      <p className="text-sm text-green-700">
                        Where it is necessary for our legitimate interests and your rights do not override those interests.
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-800 mb-2">Legal Obligation</h3>
                      <p className="text-sm text-yellow-700">
                        Where we need to comply with a legal obligation.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-800 mb-2">Consent</h3>
                      <p className="text-sm text-purple-700">
                        Where we have obtained your active agreement for a specified purpose, like email newsletters.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Section 5: Purposes for Processing */}
            <section id="purposes" className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('purposes')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">5. Purposes for Which We Will Use Your Personal Data</h2>
                </div>
                {isExpanded('purposes') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('purposes') && (
                <div className="px-6 pb-6">
                  <p className="mb-6">
                    We have set out below, in a table format, a description of all the ways we plan to use the various categories 
                    of your personal data, and which of the legal bases we rely on to do so.
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border border-gray-200 p-3 text-left font-semibold">Purpose/Use</th>
                          <th className="border border-gray-200 p-3 text-left font-semibold">Type of Data</th>
                          <th className="border border-gray-200 p-3 text-left font-semibold">Lawful Basis</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-200 p-3">To enable you to submit an enquiry to us</td>
                          <td className="border border-gray-200 p-3">Identity, Contact</td>
                          <td className="border border-gray-200 p-3">Contract, Legitimate Interests</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 p-3">To enable you to sign up to or use our services</td>
                          <td className="border border-gray-200 p-3">Identity, Contact, Transaction, Marketing</td>
                          <td className="border border-gray-200 p-3">Contract, Legitimate Interests</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 p-3">To manage our relationship with you</td>
                          <td className="border border-gray-200 p-3">Identity, Contact, Profile, Marketing</td>
                          <td className="border border-gray-200 p-3">Contract, Legal Obligation, Legitimate Interests</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 p-3">To enable you to register for our mailing list</td>
                          <td className="border border-gray-200 p-3">Identity, Contact, Marketing</td>
                          <td className="border border-gray-200 p-3">Contract, Consent, Legitimate Interests</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 p-3">To administer and protect our business</td>
                          <td className="border border-gray-200 p-3">Identity, Contact, Technical</td>
                          <td className="border border-gray-200 p-3">Legitimate Interests, Legal Obligation</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* Section 6: Direct Marketing */}
            <section id="marketing" className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('marketing')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">6. Direct Marketing</h2>
                </div>
                {isExpanded('marketing') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('marketing') && (
                <div className="px-6 pb-6">
                  <p className="mb-4">
                    You will receive marketing communications from us if you have requested information from us or purchased goods or services 
                    from us and you have not opted out of receiving the marketing.
                  </p>
                  <p>
                    We may also analyse your Identity Data, Contact Data, Technical Data, Usage Data and Profile Data to form a view which products, 
                    services and offers may be of interest to you so that we can then send you relevant marketing communications.
                  </p>
                </div>
              )}
            </section>

            {/* Section 7: Third Party Marketing */}
            <section id="third-party-marketing" className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('third-party-marketing')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">7. Third Party Marketing</h2>
                </div>
                {isExpanded('third-party-marketing') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('third-party-marketing') && (
                <div className="px-6 pb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800">
                      <strong>We do not sell or share your personal data with third parties.</strong> In the event that we want to do so, 
                      we will get your express consent before we share your personal data with any third party for their own direct marketing purposes.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Section 8: Opting Out */}
            <section id="opt-out" className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('opt-out')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">8. Opting Out of Marketing</h2>
                </div>
                {isExpanded('opt-out') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('opt-out') && (
                <div className="px-6 pb-6">
                  <p className="mb-4">
                    You can ask to stop sending you marketing communications at any time by following the opt-out links within any marketing 
                    communication sent to you or by contacting us at{' '}
                    <a href="mailto:privacy@connectgo.co.uk" className="text-stratosphere hover:underline">privacy@connectgo.co.uk</a>.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      <strong>Note:</strong> If you opt out of receiving marketing communications, you may still receive service-related 
                      communications that are essential for administrative or customer service purposes.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Section 9: Cookies */}
            <section id="cookies" className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('cookies')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Cookie className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">9. Cookies</h2>
                </div>
                {isExpanded('cookies') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('cookies') && (
                <div className="px-6 pb-6">
                  <p className="mb-6">
                    Our website uses cookies to distinguish you from other users and provide you with a good experience. 
                    A cookie is a small file of letters and numbers stored on your browser or computer's hard drive.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-2">Strictly Necessary Cookies</h3>
                      <p className="text-sm text-red-700">
                        Required for website operation. Enable you to log into secure areas, use shopping cart, or e-billing services.
                      </p>
                    </div>
                    
                    <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Analytical/Performance Cookies</h3>
                      <p className="text-sm text-blue-700">
                        Help us recognize and count visitors and see how they move around our website to improve functionality.
                      </p>
                    </div>
                    
                    <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Functionality Cookies</h3>
                      <p className="text-sm text-green-700">
                        Recognize you when you return, enabling us to personalize content and remember your preferences.
                      </p>
                    </div>
                    
                    <div className="border border-purple-200 bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-800 mb-2">Targeting Cookies</h3>
                      <p className="text-sm text-purple-700">
                        Record your visit and pages viewed to make our website and advertising more relevant to your interests.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                    <h4 className="font-semibold mb-2">Managing Cookies</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      You can block cookies through your browser settings. However, blocking all cookies may prevent access to parts of our website.
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Browser-specific instructions:</strong> Chrome, Edge, Firefox, Safari, and Opera all have different cookie management settings. 
                      Please refer to your browser's help section for specific instructions.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Section 10: Disclosures */}
            <section id="disclosures" className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('disclosures')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">10. Disclosures of Your Personal Data</h2>
                </div>
                {isExpanded('disclosures') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('disclosures') && (
                <div className="px-6 pb-6">
                  <h3 className="font-semibold mb-3">We may disclose your information in the following cases:</h3>
                  <ul className="space-y-2 text-sm mb-6">
                    <li>• We can disclose your personal data to our staff members and our subcontractors</li>
                    <li>• We can disclose your personal data in business transfers or mergers</li>
                    <li>• We can disclose it to other businesses in our group</li>
                    <li>• We can disclose it if we have a legal obligation to do so</li>
                    <li>• We can exchange information with others to protect against fraud</li>
                  </ul>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Google Workspace Integration</h4>
                    <p className="text-sm text-yellow-700">
                      We use Google Workspace to enhance platform functionality. For details on how Google processes your data, 
                      see their <a href="https://policies.google.com/privacy?hl=en-US" className="underline">privacy policy</a>.
                    </p>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    We require all third parties to respect the security of your personal data and treat it in accordance with the law.
                  </p>
                </div>
              )}
            </section>

            {/* Section 11: Data Security */}
            <section className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('security')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">11. Data Security</h2>
                </div>
                {isExpanded('security') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('security') && (
                <div className="px-6 pb-6">
                  <p className="mb-4">
                    Data security is of great importance to us, and to protect your data we have put in place suitable physical, 
                    electronic, and managerial procedures to safeguard and secure data we collect.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="text-sm">TLS 1.2 encryption for secure communication</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Lock className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Password protected accounts</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Globe className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Secure hosting by TransIP</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Eye className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Limited access to authorized personnel</span>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> The transmission of information via the internet is not completely secure. 
                      We cannot guarantee the security of your information transmitted to our website.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Section 12: International Transfers */}
            <section className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('transfers')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">12. International Transfers</h2>
                </div>
                {isExpanded('transfers') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('transfers') && (
                <div className="px-6 pb-6">
                  <p className="mb-4">
                    We may transfer your personal data outside of the UK or the European Economic Area (EEA) where we engage third parties 
                    to provide services on our behalf. We ensure similar protection through adequate safeguards.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        • We only transfer to countries with adequate protection levels
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        • We use standard contractual terms approved for UK transfers
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Section 13: Data Retention */}
            <section className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('retention')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">13. Data Retention</h2>
                </div>
                {isExpanded('retention') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('retention') && (
                <div className="px-6 pb-6">
                  <p className="mb-4">
                    We will only retain your personal data for as long as reasonably necessary to fulfil the purposes we collected it for.
                  </p>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">Legal Requirements</h4>
                    <p className="text-sm text-yellow-800">
                      By law we must keep basic customer information for six years after they cease being customers for tax purposes.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Account Inactivity</h4>
                    <p className="text-sm text-blue-800">
                      If you don't log in for six months, we'll send a reminder email. 
                      If no response after one month, the account may be deleted.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Section 14: Your Rights */}
            <section id="your-rights" className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('your-rights')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">14. Your Legal Rights</h2>
                </div>
                {isExpanded('your-rights') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('your-rights') && (
                <div className="px-6 pb-6">
                  <p className="mb-6">
                    You have several rights under data protection laws in relation to your personal data:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Eye className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-blue-800">Request Access</h3>
                        <p className="text-sm text-blue-700">
                          Receive a copy of the personal data we hold about you (subject access request).
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <Lock className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-green-800">Request Correction</h3>
                        <p className="text-sm text-green-700">
                          Have any incomplete or inaccurate data corrected.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <Shield className="h-5 w-5 text-red-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-red-800">Request Erasure</h3>
                        <p className="text-sm text-red-700">
                          Ask us to delete or remove personal data where there's no good reason for continued processing.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Users className="h-5 w-5 text-yellow-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-yellow-800">Object to Processing</h3>
                        <p className="text-sm text-yellow-700">
                          Object to processing where we rely on legitimate interests, including direct marketing.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <Globe className="h-5 w-5 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-purple-800">Request Transfer</h3>
                        <p className="text-sm text-purple-700">
                          Receive your personal data in a structured, machine-readable format for transfer to another service.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Lock className="h-5 w-5 text-gray-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Withdraw Consent</h3>
                        <p className="text-sm text-gray-700">
                          Withdraw consent at any time where we rely on consent for processing.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-stratosphere/10 rounded-lg">
                    <h4 className="font-semibold text-stratosphere mb-2">How to Exercise Your Rights</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      To exercise any of these rights, please contact us at{' '}
                      <a href="mailto:privacy@connectgo.co.uk" className="text-stratosphere hover:underline">
                        privacy@connectgo.co.uk
                      </a>
                    </p>
                    <p className="text-sm text-gray-700">
                      You will not have to pay a fee to access your personal data or exercise other rights. 
                      We try to respond to all legitimate requests within one month.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Section 15: Third Party Links */}
            <section className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('third-party-links')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">15. Third-Party Links</h2>
                </div>
                {isExpanded('third-party-links') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('third-party-links') && (
                <div className="px-6 pb-6">
                  <p className="mb-4">
                    Our website may include links to third-party websites. We do not control these websites and are not responsible 
                    for their privacy statements. We encourage you to read the privacy policy of every website you visit.
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Platform Distributors:</strong> Where the platform is offered by distributors, we remain the data processor 
                      and data is not shared with partners.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Section 16: Changes */}
            <section className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('changes')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">16. Changes to This Privacy Policy</h2>
                </div>
                {isExpanded('changes') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('changes') && (
                <div className="px-6 pb-6">
                  <p className="mb-4">
                    We keep our privacy policy under regular review. This version was last updated on {lastUpdated}.
                  </p>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Your Responsibility:</strong> Please keep us informed if your personal data changes during your 
                      relationship with us, for example a new address or email address.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Data Security & Retention */}
            <section className="bg-white rounded-lg shadow-sm border border-sky/20">
              <button
                onClick={() => toggleSection('security')}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-stratosphere" />
                  <h2 className="text-xl font-semibold text-stratosphere">Data Security & Retention</h2>
                </div>
                {isExpanded('security') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {isExpanded('security') && (
                <div className="px-6 pb-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-stratosphere mb-3">Security Measures</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <Shield className="h-5 w-5 text-green-600" />
                          <span className="text-sm">TLS 1.2 encryption for secure communication</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <Lock className="h-5 w-5 text-green-600" />
                          <span className="text-sm">Password protected accounts</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <Globe className="h-5 w-5 text-green-600" />
                          <span className="text-sm">Secure hosting by TransIP</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <Eye className="h-5 w-5 text-green-600" />
                          <span className="text-sm">Limited access to authorized personnel</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-stratosphere mb-3">Data Retention</h3>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <ul className="text-sm text-yellow-800 space-y-2">
                          <li>• We retain personal data only as long as necessary for the stated purposes</li>
                          <li>• Basic customer information kept for 6 years after cessation for tax purposes</li>
                          <li>• Account inactivity: Reminder email after 6 months, deletion after 7 months of inactivity</li>
                          <li>• We may anonymize data for research or statistical purposes</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

          </div>

          {/* Footer Contact */}
          <div className="mt-12 bg-stratosphere text-white rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Have Questions About Your Privacy?</h2>
              <p className="text-sky-tint/90 mb-6">
                We're committed to transparency and protecting your personal data. 
                If you have any questions or concerns, please don't hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="mailto:privacy@connectgo.co.uk"
                  className="bg-white text-stratosphere px-6 py-3 rounded-lg hover:bg-sky-tint transition-colors flex items-center gap-2"
                >
                  <Mail className="h-5 w-5" />
                  Contact Privacy Team
                </a>
                <div className="text-sky-tint/80 text-sm">
                  Response within 1 month guaranteed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}