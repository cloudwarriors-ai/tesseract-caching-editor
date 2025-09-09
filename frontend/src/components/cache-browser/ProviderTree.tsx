import { useState } from 'react';
import { ChevronRight, ChevronDown, Globe, Server, Clock, Zap } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { cn, formatRelativeTime, formatFileSize } from '../../lib/utils';
import { getProviderIcon, getMethodColor } from '../../lib/api';
import { useCacheStore } from '../../stores/cacheStore';
import type { ProviderNode, EndpointNode } from '../../types/api';

interface ProviderTreeProps {
  providers: ProviderNode[];
  onEndpointSelect: (endpoint: EndpointNode) => void;
}

export const ProviderTree = ({ providers, onEndpointSelect }: ProviderTreeProps) => {
  const { expandedProviders, selectedEntry, toggleProvider } = useCacheStore();
  
  if (providers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Globe className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">No Cache Entries</h3>
        <p className="text-sm text-muted-foreground">
          No cached API responses found. Make some API calls to see them here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {providers.map((provider) => (
        <ProviderNode 
          key={provider.name}
          provider={provider}
          isExpanded={expandedProviders.includes(provider.name)}
          onToggle={() => toggleProvider(provider.name)}
          onEndpointSelect={onEndpointSelect}
          selectedEntry={selectedEntry}
        />
      ))}
    </div>
  );
};

interface ProviderNodeProps {
  provider: ProviderNode;
  isExpanded: boolean;
  onToggle: () => void;
  onEndpointSelect: (endpoint: EndpointNode) => void;
  selectedEntry: EndpointNode | null;
}

const ProviderNode = ({
  provider,
  isExpanded,
  onToggle,
  onEndpointSelect,
  selectedEntry,
}: ProviderNodeProps) => {
  const hasModifications = provider.stats.modified_count > 0;
  const lastActivityTime = provider.stats.last_activity;
  
  return (
    <div className="space-y-1">
      {/* Provider Header */}
      <div
        className={cn(
          'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'group'
        )}
        onClick={onToggle}
      >
        <button className="flex items-center gap-2 flex-1 text-left">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          
          <span className="text-lg" title={provider.name}>
            {getProviderIcon(provider.name)}
          </span>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{provider.name}</span>
              {hasModifications && (
                <Badge variant="warning" className="text-xs">
                  {provider.stats.modified_count} modified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{provider.stats.total_entries} entries</span>
              <span>{formatFileSize(provider.stats.avg_response_size)} avg</span>
              {lastActivityTime && (
                <span>{formatRelativeTime(lastActivityTime)}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Server className="w-4 h-4 text-muted-foreground" />
          </div>
        </button>
      </div>
      
      {/* Endpoints List */}
      {isExpanded && (
        <div className="ml-6 space-y-1 border-l border-border pl-4">
          {provider.endpoints.map((endpoint) => (
            <EndpointNode
              key={endpoint.id}
              endpoint={endpoint}
              isSelected={selectedEntry?.cache_key === endpoint.cache_key}
              onSelect={() => onEndpointSelect(endpoint)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface EndpointNodeProps {
  endpoint: EndpointNode;
  isSelected: boolean;
  onSelect: () => void;
}

const EndpointNode = ({ endpoint, isSelected, onSelect }: EndpointNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isSelected && 'bg-accent text-accent-foreground',
        'group'
      )}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Method Badge */}
      <Badge 
        variant="outline" 
        className={cn(
          'text-xs font-mono min-w-[3rem] justify-center',
          getMethodColor(endpoint.method)
        )}
      >
        {endpoint.method}
      </Badge>
      
      {/* Path and Status */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm truncate">{endpoint.path}</span>
          <Badge 
            variant={endpoint.status >= 400 ? 'destructive' : endpoint.status >= 300 ? 'warning' : 'success'}
            className="text-xs"
          >
            {endpoint.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{formatFileSize(endpoint.response_size)}</span>
          <span>{endpoint.content_type.split('/')[1] || 'unknown'}</span>
          {endpoint.last_modified && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(endpoint.last_modified)}
            </span>
          )}
        </div>
      </div>
      
      {/* Status Indicators */}
      <div className="flex items-center gap-1">
        {endpoint.is_modified && (
          <div className="w-2 h-2 bg-blue-500 rounded-full" title="Modified" />
        )}
        
        {(isHovered || isSelected) && (
          <Zap className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
};