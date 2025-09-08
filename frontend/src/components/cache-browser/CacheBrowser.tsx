import { Loader2, RefreshCw, AlertCircle, Database } from 'lucide-react';
import { useOrganizedCache } from '../../hooks/useCache';
import { useCacheProviders, useCacheStore } from '../../stores/cacheStore';
import { Button } from '../ui/Button';
import { CacheStats } from './CacheStats';
import { SearchFilter } from './SearchFilter';
import { ProviderTree } from './ProviderTree';
import type { EndpointNode } from '../../types/api';

interface CacheBrowserProps {
  onEndpointSelect: (endpoint: EndpointNode) => void;
  className?: string;
}

export const CacheBrowser = ({ onEndpointSelect, className }: CacheBrowserProps) => {
  const { isLoading, error, refetch, isFetching } = useOrganizedCache();
  const filteredProviders = useCacheProviders();
  const { setSelectedEntry } = useCacheStore();
  
  const handleEndpointSelect = (endpoint: EndpointNode) => {
    setSelectedEntry(endpoint);
    onEndpointSelect(endpoint);
  };
  
  const handleRefresh = async () => {
    await refetch();
  };
  
  if (error) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to Load Cache
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Cache Browser</h2>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {/* Stats */}
      <CacheStats />
      
      {/* Search and Filters */}
      <SearchFilter />
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading cache data...</span>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="p-4">
              <ProviderTree 
                providers={filteredProviders}
                onEndpointSelect={handleEndpointSelect}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Loading Overlay for Refresh */}
      {isFetching && !isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-3 shadow-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Refreshing...</span>
          </div>
        </div>
      )}
    </div>
  );
};