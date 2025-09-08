import { useEffect, useCallback } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { useCacheEntry, useOriginalCacheEntry, useCacheOperations } from './useCache';
import { useNotifications } from '../stores/uiStore';
import type { Modifications } from '../types/api';
import { debounce } from '../lib/utils';

// Main editor hook
export const useEditor = (cacheKey: string | null) => {
  const {
    originalEntry,
    currentEntry,
    isDirty,
    validationErrors,
    isLoading,
    isSaving,
    isTesting,
    error,
    loadEntry,
    updateContent,
    updateHeaders,
    updateStatus,
    updateField,
    getModifications,
    hasChanges,
    validateEntry,
    setLoading,
    setSaving,
    setTesting,
    setError,
    markClean,
    reset,
  } = useEditorStore();
  
  const { addNotification } = useNotifications();
  const { modify, test, isModifying, isOperating } = useCacheOperations(cacheKey);
  
  // Load cache entry data
  const { data: entryData, isLoading: entryLoading, error: entryError } = useCacheEntry(cacheKey);
  const { data: originalData } = useOriginalCacheEntry(cacheKey);
  
  // Load entry data into editor when it changes
  useEffect(() => {
    if (entryData) {
      setLoading(entryLoading);
      setError(entryError?.message || null);
      loadEntry(entryData, originalData);
    }
  }, [entryData, originalData, entryLoading, entryError, loadEntry, setLoading, setError]);
  
  // Auto-validation with debouncing
  const debouncedValidation = useCallback(
    debounce(() => validateEntry(), 500),
    [validateEntry]
  );
  
  useEffect(() => {
    if (isDirty) {
      debouncedValidation();
    }
  }, [isDirty, debouncedValidation]);
  
  // Save modifications
  const saveChanges = useCallback(async (userId: string, notes: string = '') => {
    if (!cacheKey || !hasChanges()) return;
    
    const modifications = getModifications();
    if (!modifications) return;
    
    setSaving(true);
    try {
      await modify({
        cache_key: cacheKey,
        modifications,
        user_id: userId,
        notes,
      });
      markClean();
    } finally {
      setSaving(false);
    }
  }, [cacheKey, hasChanges, getModifications, modify, setSaving, markClean]);
  
  // Test modifications
  const testChanges = useCallback(async () => {
    if (!cacheKey) return;
    
    const modifications = getModifications();
    if (!modifications) {
      addNotification({
        type: 'info',
        title: 'No Changes',
        message: 'No modifications to test',
        autoHide: true,
      });
      return;
    }
    
    setTesting(true);
    try {
      await test({
        cache_key: cacheKey,
        modifications,
      });
    } finally {
      setTesting(false);
    }
  }, [cacheKey, getModifications, test, setTesting, addNotification]);
  
  // Content update handlers
  const handleContentChange = useCallback((content: any) => {
    updateContent(content);
  }, [updateContent]);
  
  const handleHeadersChange = useCallback((headers: Record<string, any>) => {
    updateHeaders(headers);
  }, [updateHeaders]);
  
  const handleStatusChange = useCallback((status: number) => {
    updateStatus(status);
  }, [updateStatus]);
  
  const handleFieldChange = useCallback((path: string, value: any) => {
    updateField(path, value);
  }, [updateField]);
  
  // Cleanup on unmount or cache key change
  useEffect(() => {
    return () => {
      if (cacheKey === null) {
        reset();
      }
    };
  }, [cacheKey, reset]);
  
  return {
    // Entry data
    originalEntry,
    currentEntry,
    
    // State
    isDirty,
    hasChanges: hasChanges(),
    validationErrors,
    
    // Loading states
    isLoading: isLoading || entryLoading,
    isSaving: isSaving || isModifying,
    isTesting,
    isOperating,
    
    // Error state
    error: error || entryError?.message,
    
    // Modifications
    modifications: getModifications(),
    
    // Actions
    saveChanges,
    testChanges,
    updateContent: handleContentChange,
    updateHeaders: handleHeadersChange,
    updateStatus: handleStatusChange,
    updateField: handleFieldChange,
    
    // Reset
    reset,
  };
};

// Hook for editor keyboard shortcuts
export const useEditorShortcuts = (editor: any, editorActions: ReturnType<typeof useEditor>) => {
  useEffect(() => {
    if (!editor) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      
      // Save: Ctrl/Cmd + S
      if (isMod && e.key === 's') {
        e.preventDefault();
        if (editorActions.isDirty) {
          // Prompt for user ID and notes
          const userId = prompt('Enter user ID:', 'developer') || 'unknown';
          const notes = prompt('Enter modification notes:', '') || '';
          editorActions.saveChanges(userId, notes);
        }
      }
      
      // Test: Ctrl/Cmd + T
      if (isMod && e.key === 't') {
        e.preventDefault();
        editorActions.testChanges();
      }
      
      // Format: Shift + Alt + F
      if (e.shiftKey && e.altKey && e.key === 'F') {
        e.preventDefault();
        editor.trigger('editor', 'editor.action.formatDocument', null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, editorActions]);
};

// Hook for auto-save functionality
export const useAutoSave = (
  editorActions: ReturnType<typeof useEditor>,
  enabled: boolean = false,
  interval: number = 30000 // 30 seconds
) => {
  const { addNotification } = useNotifications();
  
  useEffect(() => {
    if (!enabled || !editorActions.isDirty) return;
    
    const autoSaveTimer = setTimeout(() => {
      if (editorActions.isDirty && !editorActions.validationErrors?.errors.length) {
        editorActions.saveChanges('auto-save', 'Auto-saved changes');
        addNotification({
          type: 'info',
          title: 'Auto-saved',
          message: 'Changes automatically saved',
          autoHide: true,
          duration: 2000,
        });
      }
    }, interval);
    
    return () => clearTimeout(autoSaveTimer);
  }, [enabled, editorActions.isDirty, editorActions.validationErrors, interval, editorActions, addNotification]);
};

// Hook for editor preferences synchronization
export const useEditorSync = () => {
  const { fontSize, wordWrap, lineNumbers, minimap, theme } = useEditorStore(state => ({
    fontSize: state.editorFontSize || 14,
    wordWrap: state.editorWordWrap !== false,
    lineNumbers: state.editorLineNumbers !== false,
    minimap: state.editorMinimap === true,
    theme: state.editorTheme || 'vs-light',
  }));
  
  return {
    editorOptions: {
      fontSize,
      wordWrap: wordWrap ? 'on' : 'off',
      lineNumbers: lineNumbers ? 'on' : 'off',
      minimap: { enabled: minimap },
      theme,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'boundary',
      folding: true,
      foldingStrategy: 'auto',
      showFoldingControls: 'mouseover',
      unfoldOnClickAfterEndOfLine: false,
      contextmenu: true,
      mouseWheelZoom: true,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      renderLineHighlight: 'all',
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      insertSpaces: true,
      tabSize: 2,
      detectIndentation: true,
      trimAutoWhitespace: true,
      formatOnPaste: true,
      formatOnType: false,
    },
  };
};