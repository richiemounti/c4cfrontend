import React from 'react';
import { MapPin, ExternalLink, Info } from 'lucide-react';

interface LocationInputHelperProps {
  className?: string;
}

const LocationInputHelper: React.FC<LocationInputHelperProps> = ({ className = '' }) => {
  return (
    <div className={`bg-sky-50 border border-sky-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-2 mb-3">
        <Info className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-sky-900 mb-2">
            How to enter location information
          </h4>
        </div>
      </div>
      
      <div className="space-y-3 text-sm text-sky-900">
        {/* Google Maps Method */}
        <div className="flex gap-2">
          <MapPin className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Option 1: Google Maps URL (Easiest)</p>
            <ol className="list-decimal list-inside space-y-1 text-sky-800 ml-1">
              <li>Go to Google Maps and find your location</li>
              <li>Right-click on the exact spot</li>
              <li>Click "Share" or select coordinates from menu</li>
              <li>Copy and paste the full URL here</li>
            </ol>
          </div>
        </div>

        {/* Direct Coordinates Method */}
        <div className="flex gap-2">
          <ExternalLink className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Option 2: Enter Coordinates Directly</p>
            <div className="space-y-1 text-sky-800">
              <p>Accepted formats:</p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li><code className="bg-white px-1.5 py-0.5 rounded text-xs">-1.2345, 36.7890</code> (Decimal degrees)</li>
                <li><code className="bg-white px-1.5 py-0.5 rounded text-xs">1.2345S, 36.7890E</code> (With directions)</li>
                <li><code className="bg-white px-1.5 py-0.5 rounded text-xs">1°23'45"S, 36°47'30"E</code> (Degrees/Minutes/Seconds)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Tip */}
        <div className="bg-white border border-sky-200 rounded p-2 mt-2">
          <p className="text-xs text-sky-700">
            <span className="font-semibold">💡 Quick Tip:</span> On Google Maps, click anywhere on the map and the coordinates will appear at the bottom. Click them to copy!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationInputHelper;

// Export the helper text as a simple string constant if needed elsewhere
export const LOCATION_INPUT_HELPER_TEXT = `Enter location in any of these formats:

• Google Maps URL: Right-click on location → Share → Copy link
• Decimal degrees: -1.2345, 36.7890
• With directions: 1.2345S, 36.7890E or S 1.2345, E 36.7890
• Degrees/Minutes/Seconds: 1°23'45"S, 36°47'30"E

Tip: Click anywhere on Google Maps - coordinates appear at bottom. Click to copy!`;