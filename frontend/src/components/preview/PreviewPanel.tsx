import { useState } from 'react';
import { Eye, GitCompare, CheckCircle, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useLayout } from '../../stores/uiStore';
import { ResponsePreview } from './ResponsePreview';
import { DiffViewer } from './DiffViewer';
import { ValidationPanel } from './ValidationPanel';
import { cn } from '../../lib/utils';

type PreviewMode = 'current' | 'original' | 'diff' | 'validation';

interface PreviewPanelProps {
  cacheKey: string | null;
  className?: string;
}

export const PreviewPanel = ({ cacheKey, className }: PreviewPanelProps) => {
  const [mode, setMode] = useState<PreviewMode>('current');
  const { previewPanelVisible, togglePreviewPanel } = useLayout();
  
  if (!previewPanelVisible) {
    return (
      <div className={cn('flex items-center justify-center bg-muted/30 border-l border-border', className)}>
        <Button
          variant="ghost"
          onClick={togglePreviewPanel}
          className="flex flex-col items-center gap-2 p-4"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
          <span className="text-xs">Show Preview</span>
        </Button>
      </div>
    );
  }
  
  const modes = [
    {
      key: 'current' as const,
      label: 'Current',
      icon: <Eye className="w-3 h-3" />,
      description: 'View current response',
    },
    {
      key: 'original' as const,
      label: 'Original',
      icon: <Eye className="w-3 h-3" />,
      description: 'View original response',
    },
    {
      key: 'diff' as const,
      label: 'Changes',
      icon: <GitCompare className="w-3 h-3" />,
      description: 'Compare changes',
    },
    {
      key: 'validation' as const,
      label: 'Validation',
      icon: <CheckCircle className="w-3 h-3" />,
      description: 'Validation results',
    },
  ];
  
  const renderContent = () => {
    switch (mode) {
      case 'current':
        return <ResponsePreview cacheKey={cacheKey} showOriginal={false} />;
      case 'original':
        return <ResponsePreview cacheKey={cacheKey} showOriginal={true} />;
      case 'diff':
        return <DiffViewer cacheKey={cacheKey} />;
      case 'validation':
        return <ValidationPanel cacheKey={cacheKey} />;
      default:
        return <ResponsePreview cacheKey={cacheKey} showOriginal={false} />;
    }
  };
  
  return (
    <div className={cn('flex flex-col border-l border-border', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Preview</h2>
          {cacheKey && (
            <Badge variant="outline" className="text-xs">
              Active
            </Badge>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePreviewPanel}
          className="h-8 w-8 p-0"
        >
          <ChevronDown className="w-4 h-4 -rotate-90" />
        </Button>
      </div>
      
      {/* Mode Tabs */}
      <div className="flex border-b border-border bg-muted/30">
        {modes.map((modeOption) => (
          <button
            key={modeOption.key}
            onClick={() => setMode(modeOption.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 p-2 text-sm transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              mode === modeOption.key
                ? 'bg-background text-foreground border-b-2 border-primary'
                : 'text-muted-foreground'
            )}
            title={modeOption.description}
          >
            {modeOption.icon}
            <span>{modeOption.label}</span>
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {cacheKey ? (
          renderContent()
        ) : (
          <div className="h-full flex items-center justify-center text-center p-6">
            <div>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No Entry Selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Select a cache entry from the browser to see the preview
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer - Quick Actions */}
      {cacheKey && (
        <div className="border-t border-border bg-muted/30 p-2">
          <div className="flex justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('current')}
              className={cn(
                'h-6 px-2 text-xs',
                mode === 'current' && 'bg-accent'
              )}
            >
              Current
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('diff')}
              className={cn(
                'h-6 px-2 text-xs',
                mode === 'diff' && 'bg-accent'
              )}
            >
              Diff
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('validation')}
              className={cn(
                'h-6 px-2 text-xs',
                mode === 'validation' && 'bg-accent'
              )}
            >
              Validate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};