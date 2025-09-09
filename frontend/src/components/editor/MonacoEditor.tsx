import { useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useEditorPreferences } from '../../stores/uiStore';
import { useEditor, useEditorShortcuts } from '../../hooks/useEditor';
import { formatJSON, isValidJSON } from '../../lib/utils';
import { Loader2, AlertCircle } from 'lucide-react';

interface MonacoEditorProps {
  cacheKey: string | null;
  className?: string;
}

export const MonacoEditor = ({ cacheKey, className }: MonacoEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const editorSettings = useEditorPreferences();
  const editorActions = useEditor(cacheKey);
  
  // Set up keyboard shortcuts
  useEditorShortcuts(editorRef.current, editorActions);
  
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Configure JSON language features
    const monaco = editor.getModel()?.getLanguageId() === 'json' ? (window as any).monaco : null;
    if (monaco) {
      // Enable JSON schema validation
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: false,
        schemas: [{
          uri: 'http://myserver/response-schema.json',
          fileMatch: ['*'],
          schema: {
            type: 'object',
            additionalProperties: true,
          },
        }],
      });
    }
    
    // Add custom keyboard shortcuts
    editor.addCommand(monaco?.KeyMod.CtrlCmd | monaco?.KeyCode.KeyS || 0, () => {
      if (editorActions.isDirty) {
        const userId = prompt('Enter user ID:', 'developer') || 'unknown';
        const notes = prompt('Enter modification notes:', '') || '';
        editorActions.saveChanges(userId, notes);
      }
    });
    
    editor.addCommand(monaco?.KeyMod.CtrlCmd | monaco?.KeyCode.KeyT || 0, () => {
      editorActions.testChanges();
    });
  };
  
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!value) return;
    
    try {
      // Try to parse as JSON for validation
      const parsed = JSON.parse(value);
      editorActions.updateContent(parsed);
    } catch {
      // If it's not valid JSON, store as string for now
      editorActions.updateContent(value);
    }
  }, [editorActions]);
  
  // Format the current content for display
  const getEditorValue = () => {
    if (!editorActions.currentEntry) return '';
    
    const content = editorActions.currentEntry.body;
    if (typeof window !== 'undefined' && (window as any).monaco) {
      // Try to format if it's JSON
      if (isValidJSON(content)) {
        return formatJSON(JSON.parse(content));
      }
      return content;
    }
    
    return formatJSON(content);
  };
  
  // Loading state
  if (editorActions.isLoading) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading entry...</span>
        </div>
      </div>
    );
  }
  
  // Error state
  if (editorActions.error) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Error: {editorActions.error}</span>
        </div>
      </div>
    );
  }
  
  // No entry selected
  if (!editorActions.currentEntry) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No Entry Selected
          </h3>
          <p className="text-sm text-muted-foreground">
            Select a cache entry from the browser to start editing
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">
            {editorActions.currentEntry.method} {editorActions.currentEntry.path}
          </span>
          {editorActions.isDirty && (
            <span className="w-2 h-2 bg-blue-500 rounded-full" title="Modified" />
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Status: {editorActions.currentEntry.status}</span>
          <span>•</span>
          <span>JSON</span>
        </div>
      </div>
      
      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          value={getEditorValue()}
          language="json"
          theme={editorSettings.theme}
          options={{
            readOnly: editorActions.isSaving,
            fontSize: editorSettings.fontSize,
            wordWrap: editorSettings.wordWrap ? 'on' : 'off',
            lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
            minimap: { enabled: editorSettings.minimap },
          }}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          loading={
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          }
        />
      </div>
      
      {/* Validation Errors */}
      {editorActions.validationErrors && editorActions.validationErrors.errors.length > 0 && (
        <div className="border-t border-border bg-red-50 dark:bg-red-950 p-3">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Validation Errors</span>
          </div>
          <ul className="text-xs text-red-600 space-y-1">
            {editorActions.validationErrors.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Validation Warnings */}
      {editorActions.validationErrors && editorActions.validationErrors.warnings.length > 0 && (
        <div className="border-t border-border bg-yellow-50 dark:bg-yellow-950 p-3">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Warnings</span>
          </div>
          <ul className="text-xs text-yellow-600 space-y-1">
            {editorActions.validationErrors.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};