"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Construction, Wrench } from 'lucide-react';

interface MaintenancePageProps {
  /** The URL to navigate back to when the user clicks the back button */
  backUrl?: string;
  /** Optional custom title for the maintenance page */
  title?: string;
  /** Optional custom message for the maintenance page */
  message?: string;
  /** Show back button (default: true) */
  showBackButton?: boolean;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  backUrl = '/',
  title = 'Page Under Construction',
  message = 'This feature is currently under development. We\'re working hard to bring you the best experience possible.',
  showBackButton = true,
}) => {
  const router = useRouter();

  const handleGoBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-c4c-grey-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl overflow-hidden border border-c4c-rule/20">
          {/* Header Section with Gradient */}
          <div className="bg-c4c-petrol px-8 py-12 text-center relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-c4c-petrol/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-c4c-yellow/10 rounded-full -ml-16 -mb-16" />

            {/* Icon */}
            <div className="relative z-10 flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 inline-flex">
                <Construction className="w-16 h-16 text-c4c-yellow" strokeWidth={1.5} />
              </div>
            </div>

            {/* Title */}
            <h1 className="relative z-10 text-3xl md:text-4xl font-bold text-white mb-2">
              {title}
            </h1>
          </div>

          {/* Content Section */}
          <div className="px-8 py-10">
            {/* Icon Row */}
            <div className="flex justify-center gap-4 mb-8">
              <div className="bg-c4c-grey-bg rounded-lg p-4">
                <Wrench className="w-6 h-6 text-c4c-petrol" />
              </div>
              <div className="bg-c4c-tint-gold rounded-lg p-4">
                <Construction className="w-6 h-6 text-c4c-petrol" />
              </div>
              <div className="bg-c4c-tint-sage rounded-lg p-4">
                <Wrench className="w-6 h-6 text-c4c-sage" />
              </div>
            </div>

            {/* Message */}
            <p className="text-black/80 text-center text-lg leading-relaxed mb-8">
              {message}
            </p>

            {/* Features Coming Soon */}
            <div className="bg-c4c-grey-bg rounded-xl p-6 mb-8 border border-c4c-rule/20">
              <h3 className="text-black font-semibold mb-3 text-center">
                What we're building:
              </h3>
              <ul className="space-y-2 text-black/70">
                <li className="flex items-start gap-2">
                  <span className="text-c4c-sage mt-1">✓</span>
                  <span>Enhanced survey management and distribution</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-c4c-sage mt-1">✓</span>
                  <span>Advanced analytics and reporting dashboards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-c4c-sage mt-1">✓</span>
                  <span>Comprehensive stakeholder communication tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-c4c-sage mt-1">✓</span>
                  <span>GDPR-compliant data management features</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {showBackButton && (
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-c4c-coral text-black rounded-lg hover:bg-c4c-petrol hover:text-white transition-all duration-200 font-medium group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Go Back
                </button>
              )}

              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-c4c-petrol border-2 border-c4c-petrol rounded-lg hover:bg-c4c-grey-bg transition-all duration-200 font-medium"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-black/60 mt-6 text-sm">
          Need immediate assistance? Contact our support team at{' '}
          <a href="mailto:support@connect-go.com" className="text-c4c-petrol hover:text-black underline">
            support@connect-go.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;