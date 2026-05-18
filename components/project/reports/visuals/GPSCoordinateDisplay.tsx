// components/reports/GPSCoordinateDisplay.tsx
'use client';

import { ExternalLinkIcon, AlertTriangle, Info } from 'lucide-react';
import { parseGPSCoordinates, formatGPSWithCardinal, getGoogleMapsUrl } from '@/lib/utils/gps';

interface GPSCoordinateDisplayProps {
  coordinates: string;
  label?: string;
  showMap?: boolean;
  className?: string;
}

/**
 * Component to display GPS coordinates with validation and warnings
 * Handles various coordinate formats and shows appropriate feedback to users
 */
const GPSCoordinateDisplay: React.FC<GPSCoordinateDisplayProps> = ({
  coordinates,
  label = 'GPS Coordinates',
  showMap = true,
  className = ''
}) => {
  // Parse the coordinates
  const parsedCoords = coordinates ? parseGPSCoordinates(coordinates) : null;

  // If no coordinates provided
  if (!coordinates) {
    return (
      <div className={`py-3 border-b border-sky-tint/50 ${className}`}>
        <div className="flex flex-col gap-1">
          <span className="text-sky text-xs font-medium uppercase tracking-wide">{label}</span>
          <span className="text-stratosphere/60 text-sm italic">Not specified</span>
        </div>
      </div>
    );
  }

  // If coordinates couldn't be parsed
  if (!parsedCoords || !parsedCoords.isValid) {
    return (
      <div className={`py-3 border-b border-sky-tint/50 ${className}`}>
        <div className="flex flex-col gap-2">
          <span className="text-sky text-xs font-medium uppercase tracking-wide">{label}</span>
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Invalid Coordinates</p>
                <p className="text-xs text-red-600 mt-1">
                  Could not parse: "{coordinates}"
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Please update to use a standard format (e.g., "-1.2345, 36.7890")
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Coordinates are valid
  return (
    <div className={`py-3 border-b border-sky-tint/50 ${className}`}>
      <div className="flex flex-col gap-2">
        <span className="text-sky text-xs font-medium uppercase tracking-wide">{label}</span>
        
        {/* Show warning if there's one (e.g., for UTM or range conversions) */}
        {parsedCoords.warning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">{parsedCoords.warning}</p>
            </div>
          </div>
        )}

        {/* Display parsed coordinates */}
        <div className="space-y-2">
          <span className="text-stratosphere text-sm block font-medium">
            {formatGPSWithCardinal(parsedCoords.latitude, parsedCoords.longitude)}
          </span>
          
          {/* Show parsing method for transparency */}
          {parsedCoords.parseMethod && (
            <span className="text-xs text-sky/70 block">
              Format: {parsedCoords.parseMethod}
              {parsedCoords.raw !== coordinates && ' (converted)'}
            </span>
          )}

          {/* Link to Google Maps */}
          <a
            href={getGoogleMapsUrl(parsedCoords.latitude, parsedCoords.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky hover:text-stratosphere flex items-center gap-1 w-fit"
          >
            View on map <ExternalLinkIcon size={12} />
          </a>
        </div>

        {/* Embedded map if requested */}
        {showMap && (
          <div className="mt-3 bg-white rounded-lg overflow-hidden border">
            <iframe
              width="100%"
              height="250"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${parsedCoords.latitude},${parsedCoords.longitude}&zoom=12`}
              allowFullScreen
              title={`Map for ${label}`}
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default GPSCoordinateDisplay;