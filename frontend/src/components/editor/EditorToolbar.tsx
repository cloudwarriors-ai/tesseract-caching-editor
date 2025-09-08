import { Save, TestTube, RotateCcw, Play, Loader2, History } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useEditor } from '../../hooks/useEditor';
import { useEditorHistory } from '../../stores/editorStore';
import { useNotifications } from '../../stores/uiStore';

interface EditorToolbarProps {
  cacheKey: string | null;
}

export const EditorToolbar = ({ cacheKey }: EditorToolbarProps) => {
  const editorActions = useEditor(cacheKey);
  const { canUndo, canRedo, undo, redo } = useEditorHistory();
  const { addNotification } = useNotifications();
  
  const handleSave = async () => {
    const userId = prompt('Enter your user ID:', 'developer');
    if (!userId) return;
    
    const notes = prompt('Enter modification notes (optional):', '');
    
    try {
      await editorActions.saveChanges(userId, notes || '');
    } catch (error) {
      // Error handling is already done in the hook
    }
  };
  
  const handleTest = async () => {
    try {
      await editorActions.testChanges();
    } catch (error) {
      // Error handling is already done in the hook
    }
  };
  
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes? This cannot be undone.')) {
      editorActions.reset();
      addNotification({
        type: 'info',
        title: 'Reset Complete',
        message: 'All changes have been reset to original state',
        autoHide: true,
      });
    }
  };
  
  if (!editorActions.currentEntry) {
    return (
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="text-sm text-muted-foreground">No entry selected</div>
      </div>
    );
  }
  
  const hasValidationErrors = editorActions.validationErrors?.errors.length > 0;
  const hasValidationWarnings = editorActions.validationErrors?.warnings.length > 0;
  
  return (
    <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
      {/* Left Side - Entry Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">
            {editorActions.currentEntry.method} {editorActions.currentEntry.path}
          </span>
          <Badge variant="outline" className="text-xs">
            {editorActions.currentEntry.status}
          </Badge>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          {editorActions.isDirty && (
            <Badge variant="info" className="text-xs">
              Modified
            </Badge>
          )}
          
          {hasValidationErrors && (
            <Badge variant="destructive" className="text-xs">
              {editorActions.validationErrors.errors.length} Error{editorActions.validationErrors.errors.length !== 1 ? 's' : ''}
            </Badge>
          )}
          
          {hasValidationWarnings && (
            <Badge variant="warning" className="text-xs">
              {editorActions.validationErrors.warnings.length} Warning{editorActions.validationErrors.warnings.length !== 1 ? 's' : ''}
            </Badge>
          )}
          
          {editorActions.isSaving && (
            <Badge variant="secondary" className="text-xs">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Saving...
            </Badge>
          )}
          
          {editorActions.isTesting && (
            <Badge variant="secondary" className="text-xs">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Testing...
            </Badge>
          )}
        </div>
      </div>
      
      {/* Right Side - Actions */}
      <div className="flex items-center gap-2">
        {/* History Controls */}
        <div className="flex items-center gap-1 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => undo()}
            disabled={!canUndo || editorActions.isOperating}
            title="Undo (Ctrl+Z)"
            className="h-8 px-2"
          >
            <History className="w-4 h-4 rotate-180" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => redo()}
            disabled={!canRedo || editorActions.isOperating}
            title="Redo (Ctrl+Y)"
            className="h-8 px-2"
          >
            <History className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Main Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={!editorActions.hasChanges || hasValidationErrors || editorActions.isOperating}
          title="Test modifications (Ctrl+T)"
          className="h-8"
        >
          {editorActions.isTesting ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <TestTube className="w-4 h-4 mr-1" />
          )}
          Test
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={!editorActions.hasChanges || editorActions.isOperating}
          title="Reset to original"
          className="h-8"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
        
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!editorActions.isDirty || hasValidationErrors || editorActions.isOperating}
          title="Save changes (Ctrl+S)"
          className="h-8"
        >
          {editorActions.isSaving ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-1" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
};