import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CacheEntry, OriginalCacheEntry, ValidationResult, Modifications } from '../types/api';
import { deepClone } from '../lib/utils';

interface EditorHistoryItem {
  entry: CacheEntry;
  timestamp: number;
}

interface EditorStore {
  // Current state
  originalEntry: CacheEntry | null;
  originalFromServer: OriginalCacheEntry | null;
  currentEntry: CacheEntry | null;
  isDirty: boolean;
  
  // History for undo/redo
  undoStack: EditorHistoryItem[];
  redoStack: EditorHistoryItem[];
  maxHistorySize: number;
  
  // Validation
  validationErrors: ValidationResult | null;
  isValidating: boolean;
  
  // UI state
  isLoading: boolean;
  isSaving: boolean;
  isTesting: boolean;
  error: string | null;
  
  // Actions
  loadEntry: (entry: CacheEntry, original?: OriginalCacheEntry) => void;
  updateContent: (content: any) => void;
  updateHeaders: (headers: Record<string, any>) => void;
  updateStatus: (status: number) => void;
  updateField: (path: string, value: any) => void;
  
  // History management
  pushToHistory: () => void;
  undo: () => boolean;
  redo: () => boolean;
  clearHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Validation
  validateEntry: () => void;
  clearValidation: () => void;
  
  // State management
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setTesting: (testing: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed values
  getModifications: () => Modifications | null;
  hasChanges: () => boolean;
  
  // Reset and cleanup
  reset: () => void;
  markClean: () => void;
}

const initialState = {
  originalEntry: null,
  originalFromServer: null,
  currentEntry: null,
  isDirty: false,
  undoStack: [],
  redoStack: [],
  maxHistorySize: 50,
  validationErrors: null,
  isValidating: false,
  isLoading: false,
  isSaving: false,
  isTesting: false,
  error: null,
};

export const useEditorStore = create<EditorStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      loadEntry: (entry, original) => {
        set({
          originalEntry: deepClone(entry),
          originalFromServer: original || null,
          currentEntry: deepClone(entry),
          isDirty: false,
          undoStack: [],
          redoStack: [],
          validationErrors: null,
          error: null,
        });
      },
      
      updateContent: (content) => {
        const { currentEntry, pushToHistory } = get();
        if (!currentEntry) return;
        
        pushToHistory();
        
        const updatedEntry = {
          ...currentEntry,
          body: content,
        };
        
        set({
          currentEntry: updatedEntry,
          isDirty: true,
          redoStack: [], // Clear redo stack when making new changes
        });
        
        get().validateEntry();
      },
      
      updateHeaders: (headers) => {
        const { currentEntry, pushToHistory } = get();
        if (!currentEntry) return;
        
        pushToHistory();
        
        const updatedEntry = {
          ...currentEntry,
          headers,
        };
        
        set({
          currentEntry: updatedEntry,
          isDirty: true,
          redoStack: [],
        });
        
        get().validateEntry();
      },
      
      updateStatus: (status) => {
        const { currentEntry, pushToHistory } = get();
        if (!currentEntry) return;
        
        pushToHistory();
        
        const updatedEntry = {
          ...currentEntry,
          status,
        };
        
        set({
          currentEntry: updatedEntry,
          isDirty: true,
          redoStack: [],
        });
        
        get().validateEntry();
      },
      
      updateField: (path, value) => {
        const { currentEntry, pushToHistory } = get();
        if (!currentEntry) return;
        
        pushToHistory();
        
        // Simple path-based field update
        const pathParts = path.split('.');
        const updatedEntry = deepClone(currentEntry);
        
        let current: any = updatedEntry;
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          if (!(part in current)) {
            current[part] = {};
          }
          current = current[part];
        }
        
        current[pathParts[pathParts.length - 1]] = value;
        
        set({
          currentEntry: updatedEntry,
          isDirty: true,
          redoStack: [],
        });
        
        get().validateEntry();
      },
      
      pushToHistory: () => {
        const { currentEntry, undoStack, maxHistorySize } = get();
        if (!currentEntry) return;
        
        const historyItem: EditorHistoryItem = {
          entry: deepClone(currentEntry),
          timestamp: Date.now(),
        };
        
        const newUndoStack = [historyItem, ...undoStack].slice(0, maxHistorySize);
        set({ undoStack: newUndoStack });
      },
      
      undo: () => {
        const { undoStack, currentEntry } = get();
        if (undoStack.length === 0) return false;
        
        const [previousState, ...remainingUndo] = undoStack;
        const currentState: EditorHistoryItem = {
          entry: deepClone(currentEntry!),
          timestamp: Date.now(),
        };
        
        set({
          currentEntry: previousState.entry,
          undoStack: remainingUndo,
          redoStack: [currentState, ...get().redoStack],
          isDirty: get().hasChanges(),
        });
        
        get().validateEntry();
        return true;
      },
      
      redo: () => {
        const { redoStack, currentEntry } = get();
        if (redoStack.length === 0) return false;
        
        const [nextState, ...remainingRedo] = redoStack;
        const currentState: EditorHistoryItem = {
          entry: deepClone(currentEntry!),
          timestamp: Date.now(),
        };
        
        set({
          currentEntry: nextState.entry,
          redoStack: remainingRedo,
          undoStack: [currentState, ...get().undoStack],
          isDirty: get().hasChanges(),
        });
        
        get().validateEntry();
        return true;
      },
      
      clearHistory: () => {
        set({ undoStack: [], redoStack: [] });
      },
      
      canUndo: () => get().undoStack.length > 0,
      canRedo: () => get().redoStack.length > 0,
      
      validateEntry: () => {
        const { currentEntry } = get();
        if (!currentEntry) return;
        
        set({ isValidating: true });
        
        const errors: string[] = [];
        const warnings: string[] = [];
        let isValidJson = true;
        let hasRequiredFields = true;
        
        // Validate JSON body
        if (currentEntry.body) {
          try {
            if (typeof currentEntry.body === 'string') {
              JSON.parse(currentEntry.body);
            }
          } catch {
            isValidJson = false;
            errors.push('Response body is not valid JSON');
          }
        }
        
        // Validate status code
        if (currentEntry.status < 100 || currentEntry.status > 599) {
          errors.push('Status code must be between 100 and 599');
        }
        
        // Validate headers
        if (currentEntry.headers) {
          Object.entries(currentEntry.headers).forEach(([key, value]) => {
            if (!key.trim()) {
              errors.push('Header names cannot be empty');
            }
            if (value === null || value === undefined) {
              warnings.push(`Header "${key}" has no value`);
            }
          });
        }
        
        // Check for required fields
        if (!currentEntry.body && currentEntry.status >= 200 && currentEntry.status < 300) {
          warnings.push('Success response has no body content');
        }
        
        const validationResult: ValidationResult = {
          is_valid_json: isValidJson,
          has_required_fields: hasRequiredFields,
          warnings,
          errors,
        };
        
        set({
          validationErrors: validationResult,
          isValidating: false,
        });
      },
      
      clearValidation: () => {
        set({ validationErrors: null });
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      setSaving: (saving) => set({ isSaving: saving }),
      setTesting: (testing) => set({ isTesting: testing }),
      setError: (error) => set({ error }),
      
      getModifications: () => {
        const { originalEntry, currentEntry } = get();
        if (!originalEntry || !currentEntry) return null;
        
        const modifications: Modifications = {};
        
        if (originalEntry.status !== currentEntry.status) {
          modifications.status = currentEntry.status;
        }
        
        if (JSON.stringify(originalEntry.headers) !== JSON.stringify(currentEntry.headers)) {
          modifications.headers = currentEntry.headers;
        }
        
        if (JSON.stringify(originalEntry.body) !== JSON.stringify(currentEntry.body)) {
          modifications.body = currentEntry.body;
        }
        
        return Object.keys(modifications).length > 0 ? modifications : null;
      },
      
      hasChanges: () => {
        const { originalEntry, currentEntry } = get();
        if (!originalEntry || !currentEntry) return false;
        
        return (
          originalEntry.status !== currentEntry.status ||
          JSON.stringify(originalEntry.headers) !== JSON.stringify(currentEntry.headers) ||
          JSON.stringify(originalEntry.body) !== JSON.stringify(currentEntry.body)
        );
      },
      
      markClean: () => {
        set({ isDirty: false });
      },
      
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'editor-store',
      enabled: typeof process !== 'undefined' && process.env.NODE_ENV === 'development',
    }
  )
);

// Selectors
export const useEditorEntry = () => useEditorStore(state => state.currentEntry);
export const useEditorOriginal = () => useEditorStore(state => state.originalEntry);
export const useEditorDirty = () => useEditorStore(state => state.isDirty);
export const useEditorValidation = () => useEditorStore(state => state.validationErrors);
export const useEditorHistory = () => useEditorStore(state => ({
  canUndo: state.canUndo(),
  canRedo: state.canRedo(),
  undo: state.undo,
  redo: state.redo,
}));
export const useEditorLoading = () => useEditorStore(state => ({
  isLoading: state.isLoading,
  isSaving: state.isSaving,
  isTesting: state.isTesting,
}));