import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ProviderNode, EndpointNode } from '../types/api';
import { storage } from '../lib/utils';

interface CacheStore {
  // State
  providers: ProviderNode[];
  selectedEntry: EndpointNode | null;
  searchFilter: string;
  statusFilter: number[];
  expandedProviders: string[];
  loading: boolean;
  error: string | null;
  
  // Stats
  totalEntries: number;
  totalProviders: number;
  modifiedEntries: number;
  
  // Actions
  setProviders: (providers: ProviderNode[]) => void;
  setSelectedEntry: (entry: EndpointNode | null) => void;
  setSearchFilter: (filter: string) => void;
  setStatusFilter: (filters: number[]) => void;
  setExpandedProviders: (providers: string[]) => void;
  toggleProvider: (providerName: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed actions
  getFilteredProviders: () => ProviderNode[];
  getProviderByName: (name: string) => ProviderNode | undefined;
  getEndpointByCacheKey: (cacheKey: string) => EndpointNode | undefined;
  
  // Persistence
  saveState: () => void;
  loadState: () => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  providers: [],
  selectedEntry: null,
  searchFilter: '',
  statusFilter: [],
  expandedProviders: [],
  loading: false,
  error: null,
  totalEntries: 0,
  totalProviders: 0,
  modifiedEntries: 0,
};

export const useCacheStore = create<CacheStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Basic setters
      setProviders: (providers) => {
        const totalEntries = providers.reduce((sum, p) => sum + p.stats.total_entries, 0);
        const modifiedEntries = providers.reduce((sum, p) => sum + p.stats.modified_count, 0);
        
        set({
          providers,
          totalEntries,
          totalProviders: providers.length,
          modifiedEntries,
        });
        get().saveState();
      },
      
      setSelectedEntry: (entry) => {
        set({ selectedEntry: entry });
        get().saveState();
      },
      
      setSearchFilter: (filter) => {
        set({ searchFilter: filter });
      },
      
      setStatusFilter: (filters) => {
        set({ statusFilter: filters });
      },
      
      setExpandedProviders: (providers) => {
        set({ expandedProviders: providers });
        get().saveState();
      },
      
      toggleProvider: (providerName) => {
        const { expandedProviders } = get();
        const newExpanded = expandedProviders.includes(providerName)
          ? expandedProviders.filter(p => p !== providerName)
          : [...expandedProviders, providerName];
        
        set({ expandedProviders: newExpanded });
        get().saveState();
      },
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      // Computed getters
      getFilteredProviders: () => {
        const { providers, searchFilter, statusFilter } = get();
        
        if (!searchFilter && statusFilter.length === 0) {
          return providers;
        }
        
        return providers
          .map(provider => {
            const filteredEndpoints = provider.endpoints.filter(endpoint => {
              // Search filter
              const matchesSearch = !searchFilter || (
                endpoint.path.toLowerCase().includes(searchFilter.toLowerCase()) ||
                endpoint.method.toLowerCase().includes(searchFilter.toLowerCase()) ||
                provider.name.toLowerCase().includes(searchFilter.toLowerCase())
              );
              
              // Status filter
              const matchesStatus = statusFilter.length === 0 || statusFilter.includes(endpoint.status);
              
              return matchesSearch && matchesStatus;
            });
            
            return {
              ...provider,
              endpoints: filteredEndpoints,
            };
          })
          .filter(provider => provider.endpoints.length > 0);
      },
      
      getProviderByName: (name) => {
        return get().providers.find(p => p.name === name);
      },
      
      getEndpointByCacheKey: (cacheKey) => {
        const { providers } = get();
        for (const provider of providers) {
          const endpoint = provider.endpoints.find(e => e.cache_key === cacheKey);
          if (endpoint) return endpoint;
        }
        return undefined;
      },
      
      // Persistence
      saveState: () => {
        const { selectedEntry, expandedProviders } = get();
        storage.set('cache-store', {
          selectedEntry,
          expandedProviders,
        });
      },
      
      loadState: () => {
        const saved = storage.get('cache-store', {});
        set({
          selectedEntry: (saved as any).selectedEntry || null,
          expandedProviders: (saved as any).expandedProviders || [],
        });
      },
      
      // Reset
      reset: () => {
        set(initialState);
        storage.remove('cache-store');
      },
    }),
    {
      name: 'cache-store',
      enabled: typeof process !== 'undefined' && process.env.NODE_ENV === 'development',
    }
  )
);

// Selectors for better performance
export const useCacheProviders = () => useCacheStore(state => state.getFilteredProviders());
export const useSelectedEntry = () => useCacheStore(state => state.selectedEntry);
export const useCacheStats = () => useCacheStore(state => ({
  totalEntries: state.totalEntries,
  totalProviders: state.totalProviders,
  modifiedEntries: state.modifiedEntries,
}));
export const useCacheLoading = () => useCacheStore(state => state.loading);
export const useCacheError = () => useCacheStore(state => state.error);