// lib/utils/validation.ts

export interface URLValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Comprehensive URL validation and sanitization
 */
export const validateURL = (url: string): URLValidationResult => {
  // Check if empty
  if (!url || !url.trim()) {
    return {
      isValid: false,
      error: 'URL cannot be empty'
    };
  }

  const trimmedUrl = url.trim();

  // Check length
  if (trimmedUrl.length > 2500) {
    return {
      isValid: false,
      error: 'URL must be less than 2500 characters'
    };
  }

  // Check for dangerous characters
  const dangerousChars = /[<>{}|\\^`\[\]]/;
  if (dangerousChars.test(trimmedUrl)) {
    return {
      isValid: false,
      error: 'URL contains invalid characters'
    };
  }

  // Sanitize: Add https:// if no protocol
  let sanitizedUrl = trimmedUrl;
  if (!/^https?:\/\//i.test(sanitizedUrl)) {
    sanitizedUrl = `https://${sanitizedUrl}`;
  }

  // Comprehensive URL validation regex (same as backend)
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
  
  if (!urlPattern.test(sanitizedUrl)) {
    return {
      isValid: false,
      error: 'Please provide a valid URL (e.g., https://example.com)'
    };
  }

  // Try to construct URL object for additional validation
  try {
    const urlObj = new URL(sanitizedUrl);
    
    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'URL must use HTTP or HTTPS protocol'
      };
    }

    // Check hostname
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      return {
        isValid: false,
        error: 'Invalid domain name'
      };
    }

    // Check for localhost/internal IPs in production (optional)
    const localhostPattern = /^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/;
    if (process.env.NODE_ENV === 'production' && localhostPattern.test(urlObj.hostname)) {
      return {
        isValid: false,
        error: 'Local URLs are not allowed'
      };
    }

    return {
      isValid: true,
      sanitized: sanitizedUrl
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format'
    };
  }
};

/**
 * Validate an array of URLs
 */
export const validateURLArray = (urls: string[]): {
  isValid: boolean;
  errors: string[];
  sanitized: string[];
} => {
  const errors: string[] = [];
  const sanitized: string[] = [];

  if (!Array.isArray(urls)) {
    return {
      isValid: false,
      errors: ['URLs must be an array'],
      sanitized: []
    };
  }

  // Filter out empty strings
  const nonEmptyUrls = urls.filter(url => url && url.trim());

  if (nonEmptyUrls.length === 0) {
    return {
      isValid: true,
      errors: [],
      sanitized: []
    };
  }

  // Check for duplicates
  const uniqueUrls = new Set<string>();
  const duplicates: string[] = [];

  nonEmptyUrls.forEach((url, index) => {
    const result = validateURL(url);
    
    if (!result.isValid) {
      errors.push(`URL ${index + 1}: ${result.error}`);
    } else if (result.sanitized) {
      // Check for duplicates
      if (uniqueUrls.has(result.sanitized)) {
        duplicates.push(result.sanitized);
      } else {
        uniqueUrls.add(result.sanitized);
        sanitized.push(result.sanitized);
      }
    }
  });

  // Add duplicate errors
  if (duplicates.length > 0) {
    errors.push(`Duplicate URLs found: ${duplicates.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Validate evidence object
 */
export const validateEvidence = (evidence: {
  source?: string;
  url?: string[];
  details?: string;
}): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validate source length
  if (evidence.source && evidence.source.length > 1000) {
    errors.push('Source must be less than 1000 characters');
  }

  // Validate URLs
  if (evidence.url && evidence.url.length > 0) {
    const urlValidation = validateURLArray(evidence.url);
    if (!urlValidation.isValid) {
      errors.push(...urlValidation.errors);
    }
  }

  // Validate details length
  if (evidence.details && evidence.details.length > 1500) {
    errors.push('Details must be less than 1500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};