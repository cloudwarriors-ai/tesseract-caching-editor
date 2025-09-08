// API types based on OpenAPI specification

export interface OrganizedCacheResponse {
  providers: ProviderNode[];
  total_providers: number;
  total_entries: number;
  modified_entries: number;
}

export interface ProviderNode {
  name: string;                    // "httpbin.org", "api.zoom.us"
  host: string;                   // Same as name (hostname)
  endpoints: EndpointNode[];
  stats: ProviderStats;
}

export interface ProviderStats {
  total_entries: number;
  last_activity: number | null;   // Unix timestamp
  avg_response_size: number;      // Bytes
  modified_count: number;
}

export interface EndpointNode {
  id: string;                     // Same as cache_key
  method: string;                 // "GET", "POST", "PUT", "DELETE"
  path: string;                   // "/get", "/v2/users"
  cache_key: string;              // Full cache key identifier
  status: number;                 // HTTP status code
  is_modified: boolean;           // Has lab proxy modifications
  last_modified: number | null;   // Unix timestamp if modified
  response_size: number;          // Response body size in bytes
  content_type: string;           // MIME type
}

export interface CacheEntry {
  method: string;
  path: string;
  status: number;
  headers: Record<string, any>;
  body: any;                      // JSON response body
  timestamp: number;              // Unix timestamp
  ttl: number | null;             // Time to live in seconds
  key_source: string;             // "auth", "body_hash", "account_id"
  lab_metadata?: LabMetadata;     // Only present if modified
}

export interface OriginalCacheEntry {
  method: string;
  path: string;
  status: number;
  headers: Record<string, any>;
  body: any;                      // JSON response body
  timestamp: number;              // Unix timestamp
  ttl: number | null;             // Time to live in seconds
  key_source: string;             // "auth", "body_hash", "account_id"
}

export interface LabMetadata {
  is_modified: boolean;
  original_body: any;
  original_headers: Record<string, any>;
  original_status: number;
  modified_by: string;
  modified_at: number;            // Unix timestamp
  modification_notes: string;
  template_id?: string;           // Future template system
  modification_id: string;        // Unique modification identifier
  original_preserved: boolean;
}

// Request/Response types
export interface ModifyCacheEntryRequest {
  cache_key: string;
  modifications: Modifications;
  user_id: string;
  notes: string;
}

export interface Modifications {
  status?: number;                // Change HTTP status code
  body?: any;                    // Replace response body content
  headers?: Record<string, any>; // Replace or add response headers
}

export interface ModifyCacheEntryResponse {
  success: boolean;
  cache_key: string;
  modifications_applied: number;
  modified_by: string;
  modification_id: string;
}

export interface ResetCacheEntryRequest {
  cache_key: string;
  user_id: string;
}

export interface ResetCacheEntryResponse {
  success: boolean;
  cache_key: string;
  reset_by: string;
  reset_at: number;              // Unix timestamp
}

export interface TestCacheModificationsRequest {
  cache_key: string;
  modifications: Modifications;
}

export interface TestCacheModificationsResponse {
  success: boolean;
  test_result: TestResult;
  modifications_tested: number;
  response_size: number;
  status_code: number;
  content_type: string;
}

export interface TestResult {
  status: number;
  headers: Record<string, any>;
  body: any;                     // Test response body
  response_time_ms: number;
  validation: ValidationResult;
  size_bytes: number;
}

export interface ValidationResult {
  is_valid_json: boolean;
  has_required_fields: boolean;
  warnings: string[];
  errors: string[];
}

export interface ErrorResponse {
  detail: string;
}

// HTTP method types
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

// Status code categories
export type StatusCategory = "success" | "redirect" | "client-error" | "server-error";

// Key source types
export type KeySource = "auth" | "body_hash" | "account_id";

// Content type categories  
export type ContentTypeCategory = "json" | "xml" | "text" | "binary";

// Helper type for editor state
export interface EditorState {
  originalEntry: CacheEntry | null;
  modifiedEntry: CacheEntry | null;
  isDirty: boolean;
  validationErrors: ValidationResult | null;
  isLoading: boolean;
  error: string | null;
}

// Helper type for cache browser state
export interface CacheBrowserState {
  providers: ProviderNode[];
  selectedEntry: EndpointNode | null;
  searchFilter: string;
  statusFilter: number[];
  loading: boolean;
  error: string | null;
  expandedProviders: string[];
}

// Utility functions for type checking
export const isModified = (entry: EndpointNode): boolean => entry.is_modified;
export const hasLabMetadata = (entry: CacheEntry): entry is CacheEntry & { lab_metadata: LabMetadata } => 
  !!entry.lab_metadata;

export const getStatusCategory = (status: number): StatusCategory => {
  if (status >= 200 && status < 300) return "success";
  if (status >= 300 && status < 400) return "redirect";
  if (status >= 400 && status < 500) return "client-error";
  return "server-error";
};

export const getContentTypeCategory = (contentType: string): ContentTypeCategory => {
  if (contentType.includes("json")) return "json";
  if (contentType.includes("xml")) return "xml";
  if (contentType.includes("text")) return "text";
  return "binary";
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

export const formatBytes = (bytes: number): string => {
  const sizes = ["B", "KB", "MB", "GB"];
  if (bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
};