import { useState } from 'react';
import { Plus, X, Copy, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useEditor } from '../../hooks/useEditor';
import { copyToClipboard } from '../../lib/utils';
import { useNotifications } from '../../stores/uiStore';

interface HeadersEditorProps {
  cacheKey: string | null;
}

export const HeadersEditor = ({ cacheKey }: HeadersEditorProps) => {
  const editorActions = useEditor(cacheKey);
  const { addNotification } = useNotifications();
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  
  if (!editorActions.currentEntry) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <div className="text-4xl mb-2">📋</div>
        <p>No entry selected</p>
      </div>
    );
  }
  
  const headers = editorActions.currentEntry.headers || {};
  const originalHeaders = editorActions.originalEntry?.headers || {};
  
  const handleHeaderChange = (key: string, value: string) => {
    const updatedHeaders = { ...headers, [key]: value };
    editorActions.updateHeaders(updatedHeaders);
  };
  
  const handleHeaderDelete = (key: string) => {
    const updatedHeaders = { ...headers };
    delete updatedHeaders[key];
    editorActions.updateHeaders(updatedHeaders);
  };
  
  const handleAddHeader = () => {
    if (!newHeaderKey.trim()) return;
    
    const updatedHeaders = { ...headers, [newHeaderKey.trim()]: newHeaderValue.trim() };
    editorActions.updateHeaders(updatedHeaders);
    setNewHeaderKey('');
    setNewHeaderValue('');
  };
  
  const handleCopyHeaders = async () => {
    const headersText = Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    const success = await copyToClipboard(headersText);
    addNotification({
      type: success ? 'success' : 'error',
      title: success ? 'Copied' : 'Copy Failed',
      message: success ? 'Headers copied to clipboard' : 'Failed to copy headers',
      autoHide: true,
    });
  };
  
  const handleResetHeaders = () => {
    editorActions.updateHeaders(originalHeaders);
  };
  
  const hasChanges = JSON.stringify(headers) !== JSON.stringify(originalHeaders);
  const headerEntries = Object.entries(headers);
  
  // Common headers for quick addition
  const commonHeaders = [
    'Content-Type',
    'Authorization',
    'Accept',
    'Cache-Control',
    'User-Agent',
    'X-Requested-With',
    'X-Custom-Header',
  ];
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">HTTP Headers</h3>
          <Badge variant="secondary" className="text-xs">
            {headerEntries.length}
          </Badge>
          {hasChanges && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" title="Modified" />
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyHeaders}
            disabled={headerEntries.length === 0}
            className="h-8 px-2"
          >
            <Copy className="w-3 h-3" />
          </Button>
          
          {hasChanges && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetHeaders}
              className="h-8 px-2"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Headers List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-3 space-y-2">
          {headerEntries.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="text-2xl mb-2">📋</div>
              <p className="text-sm">No headers defined</p>
            </div>
          ) : (
            headerEntries.map(([key, value]) => {
              const isModified = originalHeaders[key] !== value || !(key in originalHeaders);
              
              return (
                <div key={key} className="space-y-2">
                  {/* Header Key */}
                  <div className="flex items-center gap-2">
                    <Input
                      value={key}
                      onChange={(e) => {
                        if (e.target.value !== key) {
                          const updatedHeaders = { ...headers };
                          delete updatedHeaders[key];
                          updatedHeaders[e.target.value] = value;
                          editorActions.updateHeaders(updatedHeaders);
                        }
                      }}
                      placeholder="Header name"
                      className="font-mono text-sm"
                    />
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleHeaderDelete(key)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Header Value */}
                  <div className="relative">
                    <Input
                      value={String(value)}
                      onChange={(e) => handleHeaderChange(key, e.target.value)}
                      placeholder="Header value"
                      className="font-mono text-sm"
                    />
                    {isModified && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Add New Header */}
      <div className="p-3 border-t border-border space-y-2">
        <div className="text-xs text-muted-foreground mb-2">Add new header</div>
        
        {/* Quick Add Common Headers */}
        <div className="flex flex-wrap gap-1 mb-3">
          {commonHeaders
            .filter(header => !(header in headers))
            .slice(0, 4)
            .map(header => (
            <button
              key={header}
              onClick={() => setNewHeaderKey(header)}
              className="px-2 py-1 text-xs bg-muted hover:bg-accent rounded transition-colors"
            >
              {header}
            </button>
          ))}
        </div>
        
        {/* Manual Add */}
        <div className="flex gap-2">
          <Input
            value={newHeaderKey}
            onChange={(e) => setNewHeaderKey(e.target.value)}
            placeholder="Header name"
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const valueInput = e.currentTarget.parentElement?.querySelector('input:last-child') as HTMLInputElement;
                valueInput?.focus();
              }
            }}
          />
        </div>
        
        <div className="flex gap-2">
          <Input
            value={newHeaderValue}
            onChange={(e) => setNewHeaderValue(e.target.value)}
            placeholder="Header value"
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddHeader();
              }
            }}
          />
          
          <Button
            onClick={handleAddHeader}
            disabled={!newHeaderKey.trim()}
            size="sm"
            className="px-3"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};