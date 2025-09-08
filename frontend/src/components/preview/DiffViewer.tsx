import { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useEditor } from '../../hooks/useEditor';
import { useUiStore, useNotifications } from '../../stores/uiStore';
import { formatJSON, calculateDiff, copyToClipboard } from '../../lib/utils';

interface DiffViewerProps {
  cacheKey: string | null;
}

export const DiffViewer = ({ cacheKey }: DiffViewerProps) => {
  const editorActions = useEditor(cacheKey);
  const { diffViewMode, setDiffViewMode } = useUiStore();
  const { addNotification } = useNotifications();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['body', 'headers', 'status']));
  
  if (!editorActions.currentEntry || !editorActions.originalEntry) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <div className="text-4xl mb-2">🔄</div>
        <p>No changes to compare</p>
      </div>
    );
  }
  
  if (!editorActions.hasChanges) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <div className="text-4xl mb-2">✅</div>
        <h3 className="font-semibold mb-1">No Changes</h3>
        <p className="text-sm">The entry matches the original version</p>
      </div>
    );
  }
  
  const original = editorActions.originalEntry;
  const current = editorActions.currentEntry;
  
  // Calculate differences
  const statusChanged = original.status !== current.status;
  const headersChanged = JSON.stringify(original.headers) !== JSON.stringify(current.headers);
  const bodyChanged = JSON.stringify(original.body) !== JSON.stringify(current.body);
  
  const bodyDiff = bodyChanged ? calculateDiff(original.body, current.body) : [];
  const headersDiff = headersChanged ? calculateDiff(original.headers, current.headers) : [];
  
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };
  
  const copyDiff = async () => {
    const changes = [];
    
    if (statusChanged) {
      changes.push(`Status: ${original.status} → ${current.status}`);
    }
    
    if (headersChanged) {
      changes.push(`Headers: ${headersDiff.length} changes`);
      headersDiff.forEach(change => {
        changes.push(`  ${change.type}: ${change.path} = ${JSON.stringify(change.value)}`);
      });
    }
    
    if (bodyChanged) {
      changes.push(`Body: ${bodyDiff.length} changes`);
      bodyDiff.forEach(change => {
        changes.push(`  ${change.type}: ${change.path} = ${JSON.stringify(change.value)}`);
      });
    }
    
    const diffText = changes.join('\n');
    const success = await copyToClipboard(diffText);
    addNotification({
      type: success ? 'success' : 'error',
      title: success ? 'Copied' : 'Copy Failed',
      message: success ? 'Diff copied to clipboard' : 'Failed to copy diff',
      autoHide: true,
    });
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Changes</h3>
          <Badge variant="info" className="text-xs">
            {[statusChanged, headersChanged, bodyChanged].filter(Boolean).length} sections modified
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDiffViewMode(diffViewMode === 'side-by-side' ? 'inline' : 'side-by-side')}
            className="h-8 px-2"
          >
            <Eye className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={copyDiff}
            className="h-8 px-2"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {/* Diff Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-3 space-y-4">
          {/* Status Changes */}
          {statusChanged && (
            <DiffSection
              title="Status Code"
              isExpanded={expandedSections.has('status')}
              onToggle={() => toggleSection('status')}
              changeCount={1}
            >
              <div className="flex items-center gap-4 p-3 rounded border">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">Before</div>
                  <div className="font-mono text-red-600 bg-red-50 dark:bg-red-950 px-2 py-1 rounded">
                    {original.status}
                  </div>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">After</div>
                  <div className="font-mono text-green-600 bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
                    {current.status}
                  </div>
                </div>
              </div>
            </DiffSection>
          )}
          
          {/* Headers Changes */}
          {headersChanged && (
            <DiffSection
              title="Headers"
              isExpanded={expandedSections.has('headers')}
              onToggle={() => toggleSection('headers')}
              changeCount={headersDiff.length}
            >
              <div className="space-y-2">
                {headersDiff.map((change, index) => (
                  <div key={index} className="p-3 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant={
                          change.type === 'added' ? 'success' :
                          change.type === 'removed' ? 'destructive' : 'warning'
                        }
                        className="text-xs"
                      >
                        {change.type}
                      </Badge>
                      <span className="font-mono text-sm">{change.path}</span>
                    </div>
                    
                    {change.type === 'modified' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Before</div>
                          <div className="font-mono text-sm bg-red-50 dark:bg-red-950 px-2 py-1 rounded">
                            {JSON.stringify(change.oldValue)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">After</div>
                          <div className="font-mono text-sm bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
                            {JSON.stringify(change.value)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(change.type === 'added' || change.type === 'removed') && (
                      <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {JSON.stringify(change.value)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DiffSection>
          )}
          
          {/* Body Changes */}
          {bodyChanged && (
            <DiffSection
              title="Response Body"
              isExpanded={expandedSections.has('body')}
              onToggle={() => toggleSection('body')}
              changeCount={bodyDiff.length}
            >
              {bodyDiff.length < 10 ? (
                <div className="space-y-2">
                  {bodyDiff.map((change, index) => (
                    <div key={index} className="p-3 rounded border">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={
                            change.type === 'added' ? 'success' :
                            change.type === 'removed' ? 'destructive' : 'warning'
                          }
                          className="text-xs"
                        >
                          {change.type}
                        </Badge>
                        <span className="font-mono text-sm">{change.path}</span>
                      </div>
                      
                      {change.type === 'modified' && (
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Before</div>
                            <div className="font-mono text-sm bg-red-50 dark:bg-red-950 px-2 py-1 rounded break-all">
                              {JSON.stringify(change.oldValue)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">After</div>
                            <div className="font-mono text-sm bg-green-50 dark:bg-green-950 px-2 py-1 rounded break-all">
                              {JSON.stringify(change.value)}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {(change.type === 'added' || change.type === 'removed') && (
                        <div className="font-mono text-sm bg-muted px-2 py-1 rounded break-all">
                          {JSON.stringify(change.value)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded border">
                  <div className="text-center text-muted-foreground">
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-sm">Too many changes to display individually</p>
                    <p className="text-xs mt-1">{bodyDiff.length} modifications detected</p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Original</div>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                          {formatJSON(original.body)}
                        </pre>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Modified</div>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                          {formatJSON(current.body)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DiffSection>
          )}
        </div>
      </div>
    </div>
  );
};

interface DiffSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  changeCount: number;
  children: React.ReactNode;
}

const DiffSection = ({ title, isExpanded, onToggle, changeCount, children }: DiffSectionProps) => {
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
          <Badge variant="secondary" className="text-xs">
            {changeCount} change{changeCount !== 1 ? 's' : ''}
          </Badge>
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