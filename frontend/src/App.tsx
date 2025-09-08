import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CacheBrowser } from './components/cache-browser/CacheBrowser';
import { MonacoEditor } from './components/editor/MonacoEditor';
import { HeadersEditor } from './components/editor/HeadersEditor';
import { StatusEditor } from './components/editor/StatusEditor';
import { EditorToolbar } from './components/editor/EditorToolbar';
import { PreviewPanel } from './components/preview/PreviewPanel';
import { useLayout } from './stores/uiStore';
import { useCacheStore } from './stores/cacheStore';
import { cn } from './lib/utils';
import type { EndpointNode } from './types/api';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 2,
    },
  },
});

function App() {
  const { sidebarCollapsed, previewPanelVisible, previewPanelSize } = useLayout();
  const selectedEntry = useCacheStore(state => state.selectedEntry);
  const [selectedCacheKey, setSelectedCacheKey] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<'body' | 'headers' | 'status'>('body');
  
  const handleEndpointSelect = (endpoint: EndpointNode) => {
    setSelectedCacheKey(endpoint.cache_key);
  };
  
  // Calculate layout percentages
  const sidebarWidth = sidebarCollapsed ? 4 : 25;
  const previewWidth = previewPanelVisible ? previewPanelSize : 0;
  const editorWidth = 100 - sidebarWidth - previewWidth;
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex bg-background text-foreground">
        {/* Cache Browser Sidebar */}
        <div 
          className={cn(
            'border-r border-border transition-all duration-200 flex-shrink-0',
            sidebarCollapsed ? 'w-16' : 'w-1/4'
          )}
          style={{ width: `${sidebarWidth}%` }}
        >
          {sidebarCollapsed ? (
            <div className="p-2 border-b border-border">
              <button className="w-full p-2 text-muted-foreground hover:text-foreground">
                📊
              </button>
            </div>
          ) : (
            <CacheBrowser 
              onEndpointSelect={handleEndpointSelect}
              className="h-full"
            />
          )}
        </div>
        
        {/* Main Editor Area */}
        <div 
          className="flex flex-col flex-1"
          style={{ width: `${editorWidth}%` }}
        >
          {/* Editor Toolbar */}
          <EditorToolbar cacheKey={selectedCacheKey} />
          
          {/* Editor Content */}
          <div className="flex-1 flex flex-col">
            {/* Editor Tabs */}
            <div className="border-b border-border">
              <div className="flex">
                {(['body', 'headers', 'status'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setEditorTab(tab)}
                    className={cn(
                      'px-4 py-2 text-sm font-medium transition-colors border-b-2',
                      'hover:text-foreground hover:border-border',
                      editorTab === tab
                        ? 'text-foreground border-primary bg-background'
                        : 'text-muted-foreground border-transparent'
                    )}
                  >
                    {tab === 'body' && 'Response Body'}
                    {tab === 'headers' && 'Headers'}
                    {tab === 'status' && 'Status'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1">
              {editorTab === 'body' && (
                <MonacoEditor 
                  cacheKey={selectedCacheKey}
                  className="h-full"
                />
              )}
              
              {editorTab === 'headers' && (
                <HeadersEditor cacheKey={selectedCacheKey} />
              )}
              
              {editorTab === 'status' && (
                <StatusEditor cacheKey={selectedCacheKey} />
              )}
            </div>
          </div>
        </div>
        
        {/* Preview Panel */}
        {previewPanelVisible && (
          <PreviewPanel 
            cacheKey={selectedCacheKey}
            className="flex-shrink-0"
            style={{ width: `${previewWidth}%` }}
          />
        )}
      </div>
      
      {/* React Query DevTools */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;