import { useState, useCallback, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useCacheStore } from '../../stores/cacheStore';
import { useUiStore } from '../../stores/uiStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn, debounce } from '../../lib/utils';

export const SearchFilter = () => {
  const {
    searchFilter,
    statusFilter,
    setSearchFilter,
    setStatusFilter,
  } = useCacheStore();
  
  const { addToSearchHistory, searchHistory } = useUiStore();
  const [localSearch, setLocalSearch] = useState(searchFilter);
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Debounced search to avoid too many updates
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setSearchFilter(value);
      if (value.trim()) {
        addToSearchHistory(value.trim());
      }
    }, 300),
    [setSearchFilter, addToSearchHistory]
  );
  
  useEffect(() => {
    debouncedSetSearch(localSearch);
  }, [localSearch, debouncedSetSearch]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };
  
  const handleSearchSelect = (query: string) => {
    setLocalSearch(query);
    setShowHistory(false);
  };
  
  const clearSearch = () => {
    setLocalSearch('');
    setShowHistory(false);
  };
  
  const toggleStatusFilter = (status: number) => {
    const newFilter = statusFilter.includes(status)
      ? statusFilter.filter(s => s !== status)
      : [...statusFilter, status];
    setStatusFilter(newFilter);
  };
  
  const clearAllFilters = () => {
    setLocalSearch('');
    setStatusFilter([]);
    setShowFilters(false);
  };
  
  const hasActiveFilters = localSearch.trim() || statusFilter.length > 0;
  
  // Common status codes for filtering
  const statusCodes = [
    { code: 200, label: '2xx Success', color: 'success' },
    { code: 300, label: '3xx Redirect', color: 'info' },
    { code: 400, label: '4xx Client Error', color: 'warning' },
    { code: 500, label: '5xx Server Error', color: 'destructive' },
  ];
  
  return (
    <div className="p-4 border-b border-border space-y-3">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={localSearch}
            onChange={handleSearchChange}
            onFocus={() => setShowHistory(searchHistory.length > 0 && !localSearch)}
            placeholder="Search endpoints, methods, or providers..."
            className="pl-9 pr-20"
          />
          
          {/* Clear and Filter buttons */}
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {localSearch && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="h-7 w-7"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'h-7 w-7',
                hasActiveFilters && 'text-blue-600 bg-blue-50 dark:bg-blue-950'
              )}
            >
              <Filter className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {/* Search History Dropdown */}
        {showHistory && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md z-10 max-h-48 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-muted-foreground mb-2">Recent searches</div>
              {searchHistory.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchSelect(query)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground rounded transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Filter Panel */}
      {showFilters && (
        <div className="space-y-3 p-3 bg-muted/30 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status Codes</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {statusCodes.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => toggleStatusFilter(code)}
                className={cn(
                  'px-2 py-1 text-xs rounded-md border transition-colors',
                  statusFilter.includes(code)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:bg-accent'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {localSearch.trim() && (
            <Badge variant="secondary" className="text-xs">
              Search: "{localSearch.trim()}"
            </Badge>
          )}
          {statusFilter.map(status => (
            <Badge key={status} variant="secondary" className="text-xs">
              Status: {status}xx
              <button
                onClick={() => toggleStatusFilter(status)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};