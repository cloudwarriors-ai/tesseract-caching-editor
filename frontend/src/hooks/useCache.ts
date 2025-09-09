import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api, queryKeys } from '../lib/api';
import { useCacheStore } from '../stores/cacheStore';
import { useNotifications } from '../stores/uiStore';
import type { ModifyCacheEntryRequest, ResetCacheEntryRequest } from '../types/api';

// Hook for organized cache data with real-time updates
export const useOrganizedCache = () => {
  const { setProviders, setLoading, setError } = useCacheStore();
  const { addNotification } = useNotifications();
  
  const query = useQuery({
    queryKey: queryKeys.organizedCache,
    queryFn: api.getOrganizedCache,
    refetchInterval: 30000, // Poll every 30 seconds for updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });
  
  // Handle success with useEffect
  useEffect(() => {
    if (query.data) {
      setProviders(query.data.providers);
      setLoading(false);
      setError(null);
    }
  }, [query.data, setProviders, setLoading, setError]);
  
  // Handle error with useEffect
  useEffect(() => {
    if (query.error) {
      setLoading(false);
      setError(query.error instanceof Error ? query.error.message : 'Failed to load cache data');
      addNotification({
        type: 'error',
        title: 'Cache Load Error',
        message: 'Failed to load cache data from server',
        autoHide: true,
      });
    }
  }, [query.error, setLoading, setError, addNotification]);
  
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};

// Hook for individual cache entry
export const useCacheEntry = (cacheKey: string | null) => {
  const { addNotification } = useNotifications();
  
  const query = useQuery({
    queryKey: queryKeys.cacheEntry(cacheKey!),
    queryFn: () => api.getCacheEntry(cacheKey!),
    enabled: !!cacheKey,
    staleTime: 5000,
  });
  
  useEffect(() => {
    if (query.error) {
      addNotification({
        type: 'error',
        title: 'Entry Load Error',
        message: `Failed to load cache entry: ${query.error instanceof Error ? query.error.message : 'Unknown error'}`,
        autoHide: true,
      });
    }
  }, [query.error, addNotification]);
  
  return query;
};

// Hook for original cache entry
export const useOriginalCacheEntry = (cacheKey: string | null) => {
  const { addNotification } = useNotifications();
  
  const query = useQuery({
    queryKey: queryKeys.originalCacheEntry(cacheKey!),
    queryFn: () => api.getOriginalCacheEntry(cacheKey!),
    enabled: !!cacheKey,
    staleTime: 30000,
  });
  
  useEffect(() => {
    if (query.error) {
      addNotification({
        type: 'error',
        title: 'Original Entry Error',
        message: `Failed to load original entry: ${query.error instanceof Error ? query.error.message : 'Unknown error'}`,
        autoHide: true,
      });
    }
  }, [query.error, addNotification]);
  
  return query;
};

// Hook for modifying cache entries
export const useModifyCacheEntry = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  
  const mutation = useMutation({
    mutationFn: (request: ModifyCacheEntryRequest) => api.modifyCacheEntry(request),
  });
  
  useEffect(() => {
    if (mutation.isSuccess && mutation.data && mutation.variables) {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.organizedCache });
      queryClient.invalidateQueries({ queryKey: queryKeys.cacheEntry(mutation.variables.cache_key) });
      
      addNotification({
        type: 'success',
        title: 'Modification Saved',
        message: `Successfully modified cache entry with ${mutation.data.modifications_applied} changes`,
        autoHide: true,
      });
    }
  }, [mutation.isSuccess, mutation.data, mutation.variables, queryClient, addNotification]);
  
  useEffect(() => {
    if (mutation.isError) {
      addNotification({
        type: 'error',
        title: 'Modification Failed',
        message: `Failed to modify entry: ${mutation.error instanceof Error ? mutation.error.message : 'Unknown error'}`,
        autoHide: false,
      });
    }
  }, [mutation.isError, mutation.error, addNotification]);
  
  return mutation;
};

// Hook for resetting cache entries
export const useResetCacheEntry = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  
  const mutation = useMutation({
    mutationFn: (request: ResetCacheEntryRequest) => api.resetCacheEntry(request),
  });
  
  useEffect(() => {
    if (mutation.isSuccess && mutation.variables) {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.organizedCache });
      queryClient.invalidateQueries({ queryKey: queryKeys.cacheEntry(mutation.variables.cache_key) });
      
      addNotification({
        type: 'success',
        title: 'Entry Reset',
        message: 'Successfully reset cache entry to original state',
        autoHide: true,
      });
    }
  }, [mutation.isSuccess, mutation.variables, queryClient, addNotification]);
  
  useEffect(() => {
    if (mutation.isError) {
      addNotification({
        type: 'error',
        title: 'Reset Failed',
        message: `Failed to reset entry: ${mutation.error instanceof Error ? mutation.error.message : 'Unknown error'}`,
        autoHide: false,
      });
    }
  }, [mutation.isError, mutation.error, addNotification]);
  
  return mutation;
};

// Hook for testing modifications
export const useTestModifications = () => {
  const { addNotification } = useNotifications();
  
  const mutation = useMutation({
    mutationFn: api.testCacheModifications,
  });
  
  useEffect(() => {
    if (mutation.isSuccess && mutation.data) {
      const hasErrors = mutation.data.test_result.validation.errors.length > 0;
      const hasWarnings = mutation.data.test_result.validation.warnings.length > 0;
      
      if (hasErrors) {
        addNotification({
          type: 'error',
          title: 'Test Failed',
          message: `Test completed with ${mutation.data.test_result.validation.errors.length} errors`,
          autoHide: false,
        });
      } else if (hasWarnings) {
        addNotification({
          type: 'warning',
          title: 'Test Warning',
          message: `Test completed with ${mutation.data.test_result.validation.warnings.length} warnings`,
          autoHide: true,
        });
      } else {
        addNotification({
          type: 'success',
          title: 'Test Successful',
          message: `Test completed successfully (${mutation.data.test_result.response_time_ms}ms)`,
          autoHide: true,
        });
      }
    }
  }, [mutation.isSuccess, mutation.data, addNotification]);
  
  useEffect(() => {
    if (mutation.isError) {
      addNotification({
        type: 'error',
        title: 'Test Failed',
        message: `Failed to test modifications: ${mutation.error instanceof Error ? mutation.error.message : 'Unknown error'}`,
        autoHide: false,
      });
    }
  }, [mutation.isError, mutation.error, addNotification]);
  
  return mutation;
};

// Combined hook for cache operations
export const useCacheOperations = (_cacheKey: string | null) => {
  const modifyMutation = useModifyCacheEntry();
  const resetMutation = useResetCacheEntry();
  const testMutation = useTestModifications();
  
  return {
    modify: modifyMutation.mutate,
    reset: resetMutation.mutate,
    test: testMutation.mutate,
    
    // Loading states
    isModifying: modifyMutation.isPending,
    isResetting: resetMutation.isPending,
    isTesting: testMutation.isPending,
    
    // Test results
    testResult: testMutation.data,
    
    // Any operation in progress
    isOperating: modifyMutation.isPending || resetMutation.isPending || testMutation.isPending,
  };
};

// Hook for cache statistics
export const useCacheStatistics = () => {
  const { data } = useOrganizedCache();
  
  if (!data || !data.providers) {
    return {
      totalProviders: 0,
      totalEntries: 0,
      modifiedEntries: 0,
      modificationRate: 0,
      providersWithModifications: 0,
      averageEntriesPerProvider: 0,
    };
  }
  
  const providersWithModifications = data.providers.filter((p: any) => p.stats.modified_count > 0).length;
  const modificationRate = data.total_entries > 0 ? (data.modified_entries / data.total_entries) * 100 : 0;
  const averageEntriesPerProvider = data.total_providers > 0 ? data.total_entries / data.total_providers : 0;
  
  return {
    totalProviders: data.total_providers,
    totalEntries: data.total_entries,
    modifiedEntries: data.modified_entries,
    modificationRate,
    providersWithModifications,
    averageEntriesPerProvider,
  };
};