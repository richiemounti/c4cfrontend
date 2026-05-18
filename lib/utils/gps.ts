// lib/utils/gps.ts - Enhanced version with Google Maps URL support

export interface Coordinates {
  latitude: number;
  longitude: number;
  raw: string;
  isValid: boolean;
  parseMethod?: string; // For debugging: which method successfully parsed
  warning?: string; // Warning message if coordinates might be inaccurate
}

/**
 * Parse GPS coordinates from various string formats
 * Supports formats like:
 * - "-1.2345, 36.7890"
 * - "1°23'45"S, 36°47'30"E"
 * - "1.2345S 36.7890E"
 * - "S 1.2345, E 36.7890"
 * - "S05.55' - 06.30' and E30.10' - 30.50" (ranges - returns center)
 * - "201066–230754 East and 9,281,586–9,309,225 North" (UTM coordinates)
 */
export function parseGPSCoordinates(input: string): Coordinates {
  if (!input || typeof input !== 'string') {
    return {
      latitude: 0,
      longitude: 0,
      raw: input || '',
      isValid: false
    };
  }

  // Clean the input
  const cleaned = input.trim();

  // Try decimal degrees format (most common): "-1.2345, 36.7890"
  const decimalResult = tryDecimalDegrees(cleaned);
  if (decimalResult.isValid) return decimalResult;

  // Try format with N/S/E/W: "1.2345S 36.7890E" or "S 1.2345, E 36.7890"
  const cardinalResult = tryCardinalFormat(cleaned);
  if (cardinalResult.isValid) return cardinalResult;

  // Try DMS (Degrees Minutes Seconds) format: 1°23'45"S, 36°47'30"E
  const dmsResult = tryDMSFormat(cleaned);
  if (dmsResult.isValid) return dmsResult;

  // Try Degrees Minutes format (no seconds): "S05°55' and E30°10'"
  const dmResult = tryDegreesMinutesFormat(cleaned);
  if (dmResult.isValid) return dmResult;

  // Try coordinate ranges: "S05.55' - 06.30' and E30.10' - 30.50"
  const rangeResult = tryCoordinateRange(cleaned);
  if (rangeResult.isValid) return rangeResult;

  // Try UTM coordinates: "201066–230754 East and 9,281,586–9,309,225 North"
  const utmResult = tryUTMFormat(cleaned);
  if (utmResult.isValid) return utmResult;

  // If we couldn't parse it, return invalid
  return {
    latitude: 0,
    longitude: 0,
    raw: cleaned,
    isValid: false
  };
}

/**
 * Try parsing decimal degrees format: "-1.2345, 36.7890"
 */
function tryDecimalDegrees(input: string): Coordinates {
  const decimalRegex = /^([+-]?\d+\.?\d*)[,\s]+([+-]?\d+\.?\d*)$/;
  const match = input.match(decimalRegex);
  
  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    
    if (isValidLatLon(lat, lon)) {
      return {
        latitude: lat,
        longitude: lon,
        raw: input,
        isValid: true,
        parseMethod: 'decimal'
      };
    }
  }

  return { latitude: 0, longitude: 0, raw: input, isValid: false };
}

/**
 * Try parsing cardinal format: "1.2345S 36.7890E" or "S 1.2345, E 36.7890"
 */
function tryCardinalFormat(input: string): Coordinates {
  const cardinalRegex = /([NS])?\s*([+-]?\d+\.?\d*)\s*([NS])?\s*[,\s]\s*([EW])?\s*([+-]?\d+\.?\d*)\s*([EW])?/i;
  const match = input.match(cardinalRegex);
  
  if (match) {
    let lat = parseFloat(match[2]);
    let lon = parseFloat(match[5]);
    
    // Check for N/S indicator
    const latIndicator = (match[1] || match[3] || '').toUpperCase();
    if (latIndicator === 'S' && lat > 0) lat = -lat;
    
    // Check for E/W indicator
    const lonIndicator = (match[4] || match[6] || '').toUpperCase();
    if (lonIndicator === 'W' && lon > 0) lon = -lon;
    
    if (isValidLatLon(lat, lon)) {
      return {
        latitude: lat,
        longitude: lon,
        raw: input,
        isValid: true,
        parseMethod: 'cardinal'
      };
    }
  }

  return { latitude: 0, longitude: 0, raw: input, isValid: false };
}

/**
 * Try parsing DMS format: 1°23'45"S, 36°47'30"E
 */
function tryDMSFormat(input: string): Coordinates {
  const dmsRegex = /(\d+)[°\s]+(\d+)['\s]+(\d+\.?\d*)["\s]*([NS])?[,\s]+(\d+)[°\s]+(\d+)['\s]+(\d+\.?\d*)["\s]*([EW])?/i;
  const match = input.match(dmsRegex);
  
  if (match) {
    let lat = dmsToDecimal(
      parseInt(match[1]),
      parseInt(match[2]),
      parseFloat(match[3])
    );
    
    let lon = dmsToDecimal(
      parseInt(match[5]),
      parseInt(match[6]),
      parseFloat(match[7])
    );
    
    // Check for N/S indicator
    const latIndicator = (match[4] || '').toUpperCase();
    if (latIndicator === 'S') lat = -lat;
    
    // Check for E/W indicator
    const lonIndicator = (match[8] || '').toUpperCase();
    if (lonIndicator === 'W') lon = -lon;
    
    if (isValidLatLon(lat, lon)) {
      return {
        latitude: lat,
        longitude: lon,
        raw: input,
        isValid: true,
        parseMethod: 'dms'
      };
    }
  }

  return { latitude: 0, longitude: 0, raw: input, isValid: false };
}

/**
 * Try parsing Degrees Minutes format (no seconds): "S05°55' and E30°10'"
 */
function tryDegreesMinutesFormat(input: string): Coordinates {
  // Pattern for degrees and minutes only
  const dmRegex = /([NS])?\s*(\d+)[°\s]+(\d+\.?\d*)['']?\s*([NS])?\s*(?:and|,)?\s*([EW])?\s*(\d+)[°\s]+(\d+\.?\d*)['']?\s*([EW])?/i;
  const match = input.match(dmRegex);
  
  if (match) {
    let lat = dmsToDecimal(
      parseInt(match[2]),
      parseFloat(match[3]),
      0 // No seconds
    );
    
    let lon = dmsToDecimal(
      parseInt(match[6]),
      parseFloat(match[7]),
      0 // No seconds
    );
    
    // Check for N/S indicator
    const latIndicator = (match[1] || match[4] || '').toUpperCase();
    if (latIndicator === 'S') lat = -lat;
    
    // Check for E/W indicator
    const lonIndicator = (match[5] || match[8] || '').toUpperCase();
    if (lonIndicator === 'W') lon = -lon;
    
    if (isValidLatLon(lat, lon)) {
      return {
        latitude: lat,
        longitude: lon,
        raw: input,
        isValid: true,
        parseMethod: 'degrees-minutes'
      };
    }
  }

  return { latitude: 0, longitude: 0, raw: input, isValid: false };
}

/**
 * Try parsing coordinate ranges: "S05.55' - 06.30' and E30.10' - 30.50"
 * Returns the center point of the range
 */
function tryCoordinateRange(input: string): Coordinates {
  // Pattern for coordinate ranges
  const rangeRegex = /([NS])?\s*(\d+\.?\d*)['']?\s*-\s*(\d+\.?\d*)['']?\s*(?:and|,)?\s*([EW])?\s*(\d+\.?\d*)['']?\s*-\s*(\d+\.?\d*)['']?/i;
  const match = input.match(rangeRegex);
  
  if (match) {
    const lat1 = parseFloat(match[2]);
    const lat2 = parseFloat(match[3]);
    const lon1 = parseFloat(match[5]);
    const lon2 = parseFloat(match[6]);
    
    // Calculate center point
    let lat = (lat1 + lat2) / 2;
    let lon = (lon1 + lon2) / 2;
    
    // Check for N/S indicator
    const latIndicator = (match[1] || '').toUpperCase();
    if (latIndicator === 'S') lat = -lat;
    
    // Check for E/W indicator
    const lonIndicator = (match[4] || '').toUpperCase();
    if (lonIndicator === 'W') lon = -lon;
    
    if (isValidLatLon(lat, lon)) {
      return {
        latitude: lat,
        longitude: lon,
        raw: input,
        isValid: true,
        parseMethod: 'range',
        warning: 'Coordinate range detected - showing center point'
      };
    }
  }

  return { latitude: 0, longitude: 0, raw: input, isValid: false };
}

/**
 * Try parsing UTM coordinates: "201066–230754 East and 9,281,586–9,309,225 North"
 * Returns the center point of the range
 */
function tryUTMFormat(input: string): Coordinates {
  // Pattern for UTM coordinates with ranges
  const utmRegex = /(\d{1,3}(?:,?\d{3})*(?:\.\d+)?)\s*[–-]\s*(\d{1,3}(?:,?\d{3})*(?:\.\d+)?)\s*(?:East|E)?\s*(?:and|,)?\s*(\d{1,3}(?:,?\d{3})*(?:\.\d+)?)\s*[–-]\s*(\d{1,3}(?:,?\d{3})*(?:\.\d+)?)\s*(?:North|N)?/i;
  const match = input.match(utmRegex);
  
  if (match) {
    // Remove commas from numbers
    const east1 = parseFloat(match[1].replace(/,/g, ''));
    const east2 = parseFloat(match[2].replace(/,/g, ''));
    const north1 = parseFloat(match[3].replace(/,/g, ''));
    const north2 = parseFloat(match[4].replace(/,/g, ''));
    
    // Calculate center point of UTM range
    const eastCenter = (east1 + east2) / 2;
    const northCenter = (north1 + north2) / 2;
    
    // Try to convert UTM to lat/lon
    const converted = estimateLatLonFromUTM(eastCenter, northCenter);
    
    if (converted && isValidLatLon(converted.lat, converted.lon)) {
      return {
        latitude: converted.lat,
        longitude: converted.lon,
        raw: input,
        isValid: true,
        parseMethod: 'utm',
        warning: 'UTM coordinates detected - conversion may be approximate. Please verify location.'
      };
    }
  }

  return { latitude: 0, longitude: 0, raw: input, isValid: false };
}

/**
 * Estimate lat/lon from UTM coordinates
 * This is a simplified conversion - for production use, consider using a proper UTM library
 * and detecting the UTM zone
 */
function estimateLatLonFromUTM(easting: number, northing: number): { lat: number; lon: number } | null {
  // This is a very rough estimate based on typical UTM ranges
  // For Kenya/East Africa, typically UTM Zone 36S or 37S
  
  // Check if values are in reasonable UTM range
  if (easting < 100000 || easting > 900000 || northing < 1000000 || northing > 10000000) {
    return null;
  }
  
  // Rough conversion (this is NOT accurate - just for demonstration)
  // For accurate conversion, use a proper UTM library with zone info
  const lon = (easting - 500000) / 111320 + 30; // Rough estimate for East Africa
  const lat = (northing - 10000000) / 111320; // Rough estimate
  
  return { lat, lon };
}

/**
 * Convert DMS (Degrees, Minutes, Seconds) to decimal degrees
 */
function dmsToDecimal(degrees: number, minutes: number, seconds: number): number {
  return degrees + (minutes / 60) + (seconds / 3600);
}

/**
 * Validate latitude and longitude values
 */
function isValidLatLon(lat: number, lon: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Format coordinates to standard decimal degrees format
 */
export function formatGPSCoordinates(lat: number, lon: number): string {
  if (!isValidLatLon(lat, lon)) {
    return 'Invalid coordinates';
  }
  
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

/**
 * Check if a string contains valid GPS coordinates
 */
export function isValidGPSString(input: string): boolean {
  const parsed = parseGPSCoordinates(input);
  return parsed.isValid;
}

/**
 * Extract the first valid GPS coordinates from a text string
 */
export function extractGPSFromText(text: string): Coordinates | null {
  if (!text) return null;
  
  // Try to parse the entire text first
  const fullParse = parseGPSCoordinates(text);
  if (fullParse.isValid) return fullParse;
  
  // Look for coordinate patterns in the text
  const patterns = [
    /([+-]?\d+\.?\d*)[,\s]+([+-]?\d+\.?\d*)/g,
    /([NS])?\s*([+-]?\d+\.?\d*)\s*([NS])?\s*[,\s]\s*([EW])?\s*([+-]?\d+\.?\d*)\s*([EW])?/gi,
    /(\d+)[°\s]+(\d+)['\s]+(\d+\.?\d*)["\s]*([NS])?[,\s]+(\d+)[°\s]+(\d+)['\s]+(\d+\.?\d*)["\s]*([EW])?/gi
  ];
  
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const parsed = parseGPSCoordinates(match[0]);
      if (parsed.isValid) {
        return parsed;
      }
    }
  }
  
  return null;
}

/**
 * Generate a Google Maps URL from coordinates
 */
export function getGoogleMapsUrl(lat: number, lon: number): string {
  if (!isValidLatLon(lat, lon)) {
    return '';
  }
  return `https://www.google.com/maps?q=${lat},${lon}`;
}

/**
 * Format coordinates for display with cardinal directions
 */
export function formatGPSWithCardinal(lat: number, lon: number): string {
  if (!isValidLatLon(lat, lon)) {
    return 'Invalid coordinates';
  }
  
  const latDirection = lat >= 0 ? 'N' : 'S';
  const lonDirection = lon >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(6)}°${latDirection}, ${Math.abs(lon).toFixed(6)}°${lonDirection}`;
}

/**
 * Extract coordinates from Google Maps URL
 * Supports formats like:
 * - https://www.google.com/maps?q=-1.2345,36.7890
 * - https://www.google.com/maps/@-1.2345,36.7890,15z
 * - https://www.google.com/maps/place/.../@-1.2345,36.7890
 * - https://maps.app.goo.gl/... (shortened URLs - coordinates in @ format)
 */
export function parseGoogleMapsUrl(url: string): Coordinates {
  if (!url || typeof url !== 'string') {
    return { latitude: 0, longitude: 0, raw: url || '', isValid: false };
  }

  try {
    // Handle standard Google Maps URLs with ?q= parameter
    const qMatch = url.match(/[?&]q=([+-]?\d+\.?\d*),\s*([+-]?\d+\.?\d*)/);
    if (qMatch) {
      const lat = parseFloat(qMatch[1]);
      const lon = parseFloat(qMatch[2]);
      if (isValidLatLon(lat, lon)) {
        return {
          latitude: lat,
          longitude: lon,
          raw: url,
          isValid: true,
          parseMethod: 'google-maps-url-query'
        };
      }
    }

    // Handle @coordinates format (most common in shared links)
    // Matches: @-1.2345,36.7890,15z or @-1.2345,36.7890
    const atMatch = url.match(/@([+-]?\d+\.?\d*),\s*([+-]?\d+\.?\d*)(?:,\d+\.?\d*z)?/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lon = parseFloat(atMatch[2]);
      if (isValidLatLon(lat, lon)) {
        return {
          latitude: lat,
          longitude: lon,
          raw: url,
          isValid: true,
          parseMethod: 'google-maps-url-at'
        };
      }
    }

    // Handle /place/ URLs with coordinates
    const placeMatch = url.match(/\/place\/[^/]*\/@?([+-]?\d+\.?\d*),\s*([+-]?\d+\.?\d*)/);
    if (placeMatch) {
      const lat = parseFloat(placeMatch[1]);
      const lon = parseFloat(placeMatch[2]);
      if (isValidLatLon(lat, lon)) {
        return {
          latitude: lat,
          longitude: lon,
          raw: url,
          isValid: true,
          parseMethod: 'google-maps-url-place'
        };
      }
    }

    return { latitude: 0, longitude: 0, raw: url, isValid: false };
  } catch (error) {
    return { latitude: 0, longitude: 0, raw: url, isValid: false };
  }
}

/**
 * Smart parser that handles both URLs and coordinate strings
 * This is the main function you should use for location inputs
 */
export function parseLocationInput(input: string): Coordinates {
  if (!input || typeof input !== 'string') {
    return { latitude: 0, longitude: 0, raw: input || '', isValid: false };
  }

  const trimmed = input.trim();

  // Check if it looks like a URL
  if (
    trimmed.includes('google.com/maps') || 
    trimmed.includes('maps.google.com') ||
    trimmed.includes('maps.app.goo.gl') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    const urlResult = parseGoogleMapsUrl(trimmed);
    if (urlResult.isValid) return urlResult;
  }

  // Otherwise try regular coordinate parsing
  return parseGPSCoordinates(trimmed);
}

/**
 * Get helpful error message based on invalid input
 */
export function getLocationInputHelp(input: string): string {
  if (!input || input.trim().length === 0) {
    return 'Please enter coordinates or a Google Maps URL';
  }

  const trimmed = input.trim();

  // Check if it looks like a URL but failed to parse
  if (
    trimmed.includes('google.com/maps') || 
    trimmed.includes('maps.google.com') ||
    trimmed.includes('maps.app.goo.gl')
  ) {
    return 'Could not extract coordinates from URL. Try: Right-click on map location → Copy link, or enter coordinates directly';
  }

  // Otherwise it's probably coordinate format issue
  return 'Invalid coordinate format. Examples: "-1.2345, 36.7890" or "1.2345S, 36.7890E"';
}