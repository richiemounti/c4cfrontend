// pages/index.tsx - Homepage with Cookie Banner
'use client';

import Image from 'next/image';
import { FC, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeatureCard from '../components/FeatureCard';
import TakeTour from '../components/TakeTour/TakeTour';
import CookieBanner from '../components/CookieBanner';
import { createTourStep } from '../utils/tourHelpers';
import { CookieManager } from '../utils/cookieManager';

interface Feature {
  id: number;
  title: string;
}

const HomePage: FC = () => {
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  // Feature data
  const features: Feature[] = [
    {
      id: 1,
      title: "Identify Key Stakeholders – \nPinpoint who you need to \nengage for meaningful insights."
    },
    {
      id: 2,
      title: "Map Your Impact Pathway – \nDevelop a Theory of Change \nthat drives results."
    },
    {
      id: 3,
      title: "Design Standards-Aligned \nSurveys – Ask questions that \nmeet carbon, social, and \ngovernance priorities."
    },
    {
      id: 4,
      title: "Track Progress in Real Time – \nVisualize trends and measure \nimpact effortlessly"
    }
  ];

  // SIMPLIFIED 3-step welcome tour using your existing videos
  const welcomeTourSteps = [
    createTourStep(
      'what_is_rfc',
      'What is Reflect for Carbon?',
      'RfC is your comprehensive sMRV solution that streamlines social Monitoring, Reporting, and Verification for carbon projects. See how leading organizations use our platform to ensure transparency and compliance in their carbon initiatives.',
      'video',
      '/tour-videos/shot1.mp4', // Using your existing video files
      22
    ),
    createTourStep(
      'how_it_works',
      'How RfC Works',
      'Our platform follows a simple 4-step process: Build (stakeholder engagement), Measure (impact mapping), Learn (survey insights), and Tell (progress reporting). Each step is designed to strengthen your project\'s social impact and ensure GDPR compliance.',
      'video',
      '/tour-videos/shot2.mp4', // Using your existing video files
      45
    ),
    createTourStep(
      'get_started',
      'Ready to Get Started?',
      'Join organizations worldwide who trust RfC for their carbon project due diligence. Create your account today to start building stronger, more transparent carbon projects with proper community engagement.',
      'video',
      '/tour-videos/shot3.mp4', // Using your existing video files
      30
    )
  ];

  // Cookie banner logic
  useEffect(() => {
    // Check if user has already consented to cookies
    const hasConsent = CookieManager.hasConsent();
    
    if (!hasConsent) {
      // Show cookie banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowCookieBanner(true);
      }, 2000); // Show after 2 seconds to let page load first
      
      return () => clearTimeout(timer);
    }

    // Optional: Check if consent is expired and show banner again
    const isExpired = CookieManager.isConsentExpired(12); // 12 months
    if (isExpired) {
      setShowCookieBanner(true);
    }
  }, []);

  // Listen for cookie banner close events
  useEffect(() => {
    const handleConsentGiven = () => {
      setShowCookieBanner(false);
    };

    const handleConsentCleared = () => {
      setShowCookieBanner(true);
    };

    window.addEventListener('cookiePreferencesUpdated', handleConsentGiven);
    window.addEventListener('cookiePreferencesCleared', handleConsentCleared);
    
    return () => {
      window.removeEventListener('cookiePreferencesUpdated', handleConsentGiven);
      window.removeEventListener('cookiePreferencesCleared', handleConsentCleared);
    };
  }, []);

  const handleTourComplete = () => {
    console.log('Welcome tour completed!');
    // Could show a signup modal or redirect to registration
    // setShowSignupModal(true);
  };

  const handleTourSkip = () => {
    console.log('Welcome tour skipped');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex-grow">
        <div className="absolute inset-0 bg-stratosphere z-0">
          {/* Hero Background Image */}
          <Image
            src="/smrvtwo.JPG"
            alt="Carbon monitoring background"
            fill
            className="object-cover opacity-80"
            priority
          />
        </div>
        
        <div className="container mx-auto relative z-10 px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Reflect for Carbon (RfC):
              <br />Your Comprehensive sMRV Solution
            </h1>
            
            <p className="text-sm md:text-base lg:text-lg mb-8 leading-relaxed">
              Reflect for Carbon (RfC) is a tech-driven, self-service platform designed to streamline and strengthen social Monitoring, Reporting, and Verification (sMRV) for carbon projects. It brings the same social impact tracking, delivering a robust, cost-effective solution that enables teams to seamlessly integrate social considerations into MRV processes. With RfC, you can visualize, analyze, and report social outcomes, enhance project credibility, and address carbon market criticisms with transparency and integrity.
            </p>

            {/* Simplified Tour Component - only 3 steps */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <TakeTour
                tourId="rfc_welcome_tour"
                tourTitle="Discover RfC"
                tourDescription="Quick 2-minute overview of our sMRV platform"
                steps={welcomeTourSteps}
                autoShowForNewUsers={true}
                showTourButton={true}
                buttonText="See How It Works"
                onTourComplete={handleTourComplete}
                onTourSkip={handleTourSkip}
              />
              
              {/* Optional: Add a separate CTA button */}
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-ochre-500 
                               hover:bg-ochre-600 text-white rounded-lg font-medium
                               transition-colors duration-200 shadow-lg hover:shadow-xl">
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-sky-tint py-12">
        <div className="container mx-auto px-6">
          {/* Section header - no tour here to avoid confusion */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-stratosphere-500 mb-4">
              How RfC Strengthens Your Carbon Projects
            </h2>
            <p className="text-sky-500">
              Follow our proven four-step process to achieve comprehensive sMRV
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(feature => (
              <FeatureCard key={feature.id} title={feature.title} id={feature.id} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Cookie Banner - Only show when needed */}
      {showCookieBanner && <CookieBanner />}
    </div>
  );
};

export default HomePage;