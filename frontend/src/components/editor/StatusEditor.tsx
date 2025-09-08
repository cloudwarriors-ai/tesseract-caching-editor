import { useState } from 'react';
import { ChevronDown, RotateCcw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useEditor } from '../../hooks/useEditor';
import { getStatusColor } from '../../lib/api';

interface StatusEditorProps {
  cacheKey: string | null;
}

export const StatusEditor = ({ cacheKey }: StatusEditorProps) => {
  const editorActions = useEditor(cacheKey);
  const [showStatusList, setShowStatusList] = useState(false);
  const [customStatus, setCustomStatus] = useState('');
  
  if (!editorActions.currentEntry) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <div className="text-4xl mb-2">🔢</div>
        <p>No entry selected</p>
      </div>
    );
  }
  
  const currentStatus = editorActions.currentEntry.status;
  const originalStatus = editorActions.originalEntry?.status || currentStatus;
  const hasChanged = currentStatus !== originalStatus;
  
  // Common status codes grouped by category
  const statusCodes = {
    'Success (2xx)': [
      { code: 200, description: 'OK' },
      { code: 201, description: 'Created' },
      { code: 202, description: 'Accepted' },
      { code: 204, description: 'No Content' },
      { code: 206, description: 'Partial Content' },
    ],
    'Redirection (3xx)': [
      { code: 301, description: 'Moved Permanently' },
      { code: 302, description: 'Found' },
      { code: 304, description: 'Not Modified' },
      { code: 307, description: 'Temporary Redirect' },
      { code: 308, description: 'Permanent Redirect' },
    ],
    'Client Error (4xx)': [
      { code: 400, description: 'Bad Request' },
      { code: 401, description: 'Unauthorized' },
      { code: 403, description: 'Forbidden' },
      { code: 404, description: 'Not Found' },
      { code: 409, description: 'Conflict' },
      { code: 422, description: 'Unprocessable Entity' },
      { code: 429, description: 'Too Many Requests' },
    ],
    'Server Error (5xx)': [
      { code: 500, description: 'Internal Server Error' },
      { code: 502, description: 'Bad Gateway' },
      { code: 503, description: 'Service Unavailable' },
      { code: 504, description: 'Gateway Timeout' },
    ],
  };
  
  const getStatusDescription = (code: number): string => {
    for (const category of Object.values(statusCodes)) {
      const status = category.find(s => s.code === code);
      if (status) return status.description;
    }
    return 'Unknown Status';
  };
  
  const getStatusCategory = (code: number): string => {
    if (code >= 200 && code < 300) return 'success';
    if (code >= 300 && code < 400) return 'redirect';
    if (code >= 400 && code < 500) return 'client-error';
    if (code >= 500) return 'server-error';
    return 'unknown';
  };
  
  const getStatusIcon = (code: number) => {
    const category = getStatusCategory(code);
    switch (category) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'redirect': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'client-error': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'server-error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const handleStatusChange = (newStatus: number) => {
    editorActions.updateStatus(newStatus);
    setShowStatusList(false);
    setCustomStatus('');
  };
  
  const handleCustomStatusSubmit = () => {
    const status = parseInt(customStatus);
    if (status >= 100 && status <= 599) {
      handleStatusChange(status);
    }
  };
  
  const handleReset = () => {
    editorActions.updateStatus(originalStatus);
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">HTTP Status</h3>
          {hasChanged && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" title="Modified" />
          )}
        </div>
        
        {hasChanged && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      {/* Current Status Display */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          {getStatusIcon(currentStatus)}
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getStatusColor(currentStatus)}`}>
              {currentStatus}
            </span>
            <span className="text-lg text-muted-foreground">
              {getStatusDescription(currentStatus)}
            </span>
          </div>
        </div>
        
        <Badge 
          variant={
            currentStatus >= 500 ? 'destructive' :
            currentStatus >= 400 ? 'warning' :
            currentStatus >= 300 ? 'info' : 'success'
          }
          className="text-xs"
        >
          {getStatusCategory(currentStatus).replace('-', ' ').toUpperCase()}
        </Badge>
        
        {hasChanged && (
          <div className="mt-2 text-xs text-muted-foreground">
            Original: {originalStatus} ({getStatusDescription(originalStatus)})
          </div>
        )}
      </div>
      
      {/* Custom Status Input */}
      <div className="p-3 border-b border-border">
        <div className="text-xs text-muted-foreground mb-2">Custom Status Code</div>
        <div className="flex gap-2">
          <Input
            value={customStatus}
            onChange={(e) => setCustomStatus(e.target.value)}
            placeholder="Enter status code (100-599)"
            type="number"
            min="100"
            max="599"
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCustomStatusSubmit();
              }
            }}
          />
          <Button
            onClick={handleCustomStatusSubmit}
            disabled={!customStatus || parseInt(customStatus) < 100 || parseInt(customStatus) > 599}
            size="sm"
          >
            Set
          </Button>
        </div>
      </div>
      
      {/* Common Status Codes */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-muted-foreground">Common Status Codes</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStatusList(!showStatusList)}
              className="h-6 px-2"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${showStatusList ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          
          <div className="space-y-4">
            {Object.entries(statusCodes).map(([category, codes]) => (
              <div key={category}>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  {category}
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {codes.map(({ code, description }) => (
                    <button
                      key={code}
                      onClick={() => handleStatusChange(code)}
                      className={`
                        flex items-center gap-2 p-2 rounded text-left text-sm transition-colors
                        hover:bg-accent hover:text-accent-foreground
                        ${currentStatus === code ? 'bg-accent text-accent-foreground' : ''}
                      `}
                    >
                      {getStatusIcon(code)}
                      <span className={`font-mono font-semibold ${getStatusColor(code)}`}>
                        {code}
                      </span>
                      <span className="text-muted-foreground">
                        {description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Status Code Reference */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="text-xs text-muted-foreground space-y-1">
          <div><strong>2xx:</strong> Success responses</div>
          <div><strong>3xx:</strong> Redirection messages</div>
          <div><strong>4xx:</strong> Client error responses</div>
          <div><strong>5xx:</strong> Server error responses</div>
        </div>
      </div>
    </div>
  );
};