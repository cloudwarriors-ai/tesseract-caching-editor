import { useState } from 'react';
import { Copy, Eye, EyeOff, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useEditor } from '../../hooks/useEditor';
import { useNotifications } from '../../stores/uiStore';
import { formatJSON, formatFileSize, formatRelativeTime, copyToClipboard } from '../../lib/utils';
import { getStatusColor } from '../../lib/api';

interface ResponsePreviewProps {
  cacheKey: string | null;
  showOriginal?: boolean;
}

export const ResponsePreview = ({ cacheKey, showOriginal = false }: ResponsePreviewProps) => {
  const editorActions = useEditor(cacheKey);
  const { addNotification } = useNotifications();
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['body']));
  
  const entry = showOriginal ? editorActions.originalEntry : editorActions.currentEntry;
  
  if (!entry) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <div className="text-4xl mb-2">👁️</div>
        <p>No entry to preview</p>
      </div>
    );
  }
  
  const copyResponse = async () => {
    const responseText = JSON.stringify({
      status: entry.status,
      headers: entry.headers,
      body: entry.body,
    }, null, 2);
    
    const success = await copyToClipboard(responseText);
    addNotification({
      type: success ? 'success' : 'error',
      title: success ? 'Copied' : 'Copy Failed',
      message: success ? 'Response copied to clipboard' : 'Failed to copy response',
      autoHide: true,
    });
  };
  
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };
  
  const getResponseSize = () => {
    return JSON.stringify(entry.body).length;
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">
            {showOriginal ? 'Original' : 'Current'} Response
          </h3>
          {!showOriginal && editorActions.isDirty && (
            <Badge variant="info" className="text-xs">Modified</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
            className="h-8 px-2"
          >
            {viewMode === 'formatted' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={copyResponse}
            className="h-8 px-2"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {/* Response Metadata */}
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Status</div>
            <div className={`font-mono font-semibold ${getStatusColor(entry.status)}`}>
              {entry.status}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Size</div>
            <div className="font-mono">
              {formatFileSize(getResponseSize())}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Content-Type</div>
            <div className="font-mono text-xs">
              {entry.headers?.['content-type'] || entry.headers?.['Content-Type'] || 'unknown'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Modified</div>
            <div className="text-xs">
              {entry.timestamp ? formatRelativeTime(entry.timestamp) : 'Unknown'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-3 space-y-4">
          {/* Headers Section */}
          <PreviewSection
            title="Headers"
            isExpanded={expandedSections.has('headers')}
            onToggle={() => toggleSection('headers')}
            count={Object.keys(entry.headers || {}).length}
          >
            {entry.headers && Object.keys(entry.headers).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(entry.headers).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                    <div className="font-mono text-sm font-semibold min-w-0 flex-shrink-0">
                      {key}:
                    </div>
                    <div className="font-mono text-sm break-all">
                      {String(value)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No headers
              </div>
            )}
          </PreviewSection>
          
          {/* Body Section */}
          <PreviewSection
            title="Response Body"
            isExpanded={expandedSections.has('body')}
            onToggle={() => toggleSection('body')}
            count={entry.body ? 1 : 0}
          >
            {entry.body ? (
              viewMode === 'formatted' ? (
                <FormattedJsonView data={entry.body} />
              ) : (
                <pre className="text-sm font-mono bg-muted/50 p-3 rounded overflow-auto max-h-96">
                  {formatJSON(entry.body)}
                </pre>
              )
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Empty response body
              </div>
            )}
          </PreviewSection>
          
          {/* Lab Metadata (if present) */}
          {entry.lab_metadata && (
            <PreviewSection
              title="Lab Metadata"
              isExpanded={expandedSections.has('metadata')}
              onToggle={() => toggleSection('metadata')}
              count={1}
            >
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground text-xs">Modified By</div>
                    <div className="font-mono">{entry.lab_metadata.modified_by}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Modified At</div>
                    <div>{formatRelativeTime(entry.lab_metadata.modified_at)}</div>
                  </div>
                </div>
                
                {entry.lab_metadata.modification_notes && (
                  <div>
                    <div className="text-muted-foreground text-xs">Notes</div>
                    <div className="bg-muted/50 p-2 rounded text-sm">
                      {entry.lab_metadata.modification_notes}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>Modification ID: {entry.lab_metadata.modification_id}</div>
                  <div>Original Preserved: {entry.lab_metadata.original_preserved ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </PreviewSection>
          )}
        </div>
      </div>
    </div>
  );
};

interface PreviewSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  count: number;
  children: React.ReactNode;
}

const PreviewSection = ({ title, isExpanded, onToggle, count, children }: PreviewSectionProps) => {
  return (
    <div className="border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="font-medium">{title}</span>
          {count > 0 && (
            <Badge variant="secondary" className="text-xs">
              {count}
            </Badge>
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="border-t p-3">
          {children}
        </div>
      )}
    </div>
  );
};

interface FormattedJsonViewProps {
  data: any;
  level?: number;
}

const FormattedJsonView = ({ data, level = 0 }: FormattedJsonViewProps) => {
  // TODO: Implement collapsible JSON view functionality
  // const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  
  if (data === null) return <span className="text-muted-foreground">null</span>;
  if (data === undefined) return <span className="text-muted-foreground">undefined</span>;
  
  if (typeof data === 'string') {
    return <span className="text-green-600">"{data}"</span>;
  }
  
  if (typeof data === 'number') {
    return <span className="text-blue-600">{data}</span>;
  }
  
  if (typeof data === 'boolean') {
    return <span className="text-purple-600">{String(data)}</span>;
  }
  
  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-muted-foreground">[]</span>;
    
    return (
      <div className="font-mono text-sm">
        <span className="text-muted-foreground">[</span>
        <div className="ml-4">
          {data.map((item, index) => (
            <div key={index}>
              <FormattedJsonView data={item} level={level + 1} />
              {index < data.length - 1 && <span className="text-muted-foreground">,</span>}
            </div>
          ))}
        </div>
        <span className="text-muted-foreground">]</span>
      </div>
    );
  }
  
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) return <span className="text-muted-foreground">{}</span>;
    
    return (
      <div className="font-mono text-sm">
        <span className="text-muted-foreground">{'{'}</span>
        <div className="ml-4">
          {keys.map((key, index) => (
            <div key={key} className="flex">
              <span className="text-blue-600">"{key}"</span>
              <span className="text-muted-foreground">: </span>
              <FormattedJsonView data={data[key]} level={level + 1} />
              {index < keys.length - 1 && <span className="text-muted-foreground">,</span>}
            </div>
          ))}
        </div>
        <span className="text-muted-foreground">{'}'}</span>
      </div>
    );
  }
  
  return <span>{String(data)}</span>;
};