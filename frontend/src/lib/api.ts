// API client for Tesseract Caching Service Lab Proxy

import type {
  OrganizedCacheResponse,
  CacheEntry,
  OriginalCacheEntry,
  ModifyCacheEntryRequest,
  ModifyCacheEntryResponse,
  ResetCacheEntryRequest,
  ResetCacheEntryResponse,
  TestCacheModificationsRequest,
  TestCacheModificationsResponse,
  ErrorResponse,
} from '../types/api';

// API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.NODE_ENV === 'development' 
    ? 'http://localhost:4010'  // Mock server for development
    : 'http://cacheflow:8000', // Real backend for production
  ENDPOINTS: {
    ORGANIZED_CACHE: '/admin/cache/organized',
    CACHE_ENTRY: '/admin/cache/entry',
    CACHE_ENTRY_ORIGINAL: '/admin/cache/entry/original',
    CACHE_ENTRY_RESET: '/admin/cache/entry/reset',
    CACHE_TEST: '/admin/cache/test',
  },
  POLLING_INTERVAL: 5000, // ms
};

// HTTP client with error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    
    try {
      const errorData: ErrorResponse = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // If we can't parse the error response, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new ApiError(errorMessage, response.status, response);
  }

  return response.json();
}

// API functions
export const api = {
  /**
   * Get organized cache entries grouped by provider/host
   */
  getOrganizedCache: async (): Promise<OrganizedCacheResponse> => {
    return fetchWithErrorHandling<OrganizedCacheResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZED_CACHE}`
    );
  },

  /**
   * Get a specific cache entry by cache key
   */
  getCacheEntry: async (cacheKey: string): Promise<CacheEntry> => {
    const params = new URLSearchParams({ key: cacheKey });
    return fetchWithErrorHandling<CacheEntry>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CACHE_ENTRY}?${params}`
    );
  },

  /**
   * Get the original unmodified version of a cache entry
   */
  getOriginalCacheEntry: async (cacheKey: string): Promise<OriginalCacheEntry> => {
    const params = new URLSearchParams({ cache_key: cacheKey });
    return fetchWithErrorHandling<OriginalCacheEntry>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CACHE_ENTRY_ORIGINAL}?${params}`
    );
  },

  /**
   * Modify a cache entry with lab proxy changes
   */
  modifyCacheEntry: async (request: ModifyCacheEntryRequest): Promise<ModifyCacheEntryResponse> => {
    return fetchWithErrorHandling<ModifyCacheEntryResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CACHE_ENTRY}`,
      {
        method: 'PUT',
        body: JSON.stringify(request),
      }
    );
  },

  /**
   * Reset a modified cache entry back to its original state
   */
  resetCacheEntry: async (request: ResetCacheEntryRequest): Promise<ResetCacheEntryResponse> => {
    return fetchWithErrorHandling<ResetCacheEntryResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CACHE_ENTRY_RESET}`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  },

  /**
   * Test modifications without permanently saving them
   */
  testCacheModifications: async (request: TestCacheModificationsRequest): Promise<TestCacheModificationsResponse> => {
    return fetchWithErrorHandling<TestCacheModificationsResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CACHE_TEST}`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  },
};

// Query keys for TanStack Query
export const queryKeys = {
  organizedCache: ['cache-organized'] as const,
  cacheEntry: (cacheKey: string) => ['cache-entry', cacheKey] as const,
  originalCacheEntry: (cacheKey: string) => ['cache-entry-original', cacheKey] as const,
} as const;

// Utility functions for API responses
export const getProviderIcon = (providerName: string): string => {
  const icons: Record<string, string> = {
    'httpbin.org': '🌐',
    'api.zoom.us': '🔵',
    'platform.ringcentral.com': '🟠',
    'github.com': '🐙',
    'api.stripe.com': '💳',
    'api.slack.com': '💬',
  };
  return icons[providerName] || '🔗';
};

export const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return 'text-green-600';
  if (status >= 300 && status < 400) return 'text-blue-600';
  if (status >= 400 && status < 500) return 'text-red-600';
  return 'text-red-800';
};

export const getMethodColor = (method: string): string => {
  const colors: Record<string, string> = {
    GET: 'text-green-600',
    POST: 'text-blue-600',
    PUT: 'text-yellow-600',
    DELETE: 'text-red-600',
    PATCH: 'text-purple-600',
  };
  return colors[method] || 'text-gray-600';
};

export { ApiError };