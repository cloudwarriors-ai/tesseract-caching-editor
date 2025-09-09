import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useEffect } from 'react';

interface UiStore {
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Layout
  sidebarCollapsed: boolean;
  previewPanelVisible: boolean;
  previewPanelSize: number; // percentage
  
  // Editor preferences
  editorFontSize: number;
  editorWordWrap: boolean;
  editorLineNumbers: boolean;
  editorMinimap: boolean;
  editorTheme: 'vs-light' | 'vs-dark' | 'hc-black';
  
  // Preview preferences
  previewMode: 'formatted' | 'raw' | 'diff';
  diffViewMode: 'side-by-side' | 'inline';
  
  // Search and filter preferences
  searchHistory: string[];
  maxSearchHistory: number;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    autoHide: boolean;
    duration?: number;
  }>;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Layout actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setPreviewPanelVisible: (visible: boolean) => void;
  togglePreviewPanel: () => void;
  setPreviewPanelSize: (size: number) => void;
  
  // Editor actions
  setEditorFontSize: (size: number) => void;
  setEditorWordWrap: (wrap: boolean) => void;
  setEditorLineNumbers: (show: boolean) => void;
  setEditorMinimap: (show: boolean) => void;
  setEditorTheme: (theme: 'vs-light' | 'vs-dark' | 'hc-black') => void;
  
  // Preview actions
  setPreviewMode: (mode: 'formatted' | 'raw' | 'diff') => void;
  setDiffViewMode: (mode: 'side-by-side' | 'inline') => void;
  
  // Search actions
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  // Notification actions
  addNotification: (notification: Omit<UiStore['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Computed values
  getEffectiveTheme: () => 'light' | 'dark';
  getEditorTheme: () => 'vs-light' | 'vs-dark' | 'hc-black';
}

const initialState = {
  theme: 'system' as const,
  sidebarCollapsed: false,
  previewPanelVisible: true,
  previewPanelSize: 40,
  editorFontSize: 14,
  editorWordWrap: true,
  editorLineNumbers: true,
  editorMinimap: false,
  editorTheme: 'vs-light' as const,
  previewMode: 'formatted' as const,
  diffViewMode: 'side-by-side' as const,
  searchHistory: [],
  maxSearchHistory: 10,
  notifications: [],
};

export const useUiStore = create<UiStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Theme
        setTheme: (theme) => {
          set({ theme });
          // Update document class for theme
          const effectiveTheme = get().getEffectiveTheme();
          document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
        },
        
        // Layout
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setPreviewPanelVisible: (visible) => set({ previewPanelVisible: visible }),
        togglePreviewPanel: () => set(state => ({ previewPanelVisible: !state.previewPanelVisible })),
        setPreviewPanelSize: (size) => set({ previewPanelSize: Math.max(20, Math.min(80, size)) }),
        
        // Editor
        setEditorFontSize: (size) => set({ editorFontSize: Math.max(10, Math.min(24, size)) }),
        setEditorWordWrap: (wrap) => set({ editorWordWrap: wrap }),
        setEditorLineNumbers: (show) => set({ editorLineNumbers: show }),
        setEditorMinimap: (show) => set({ editorMinimap: show }),
        setEditorTheme: (theme) => set({ editorTheme: theme }),
        
        // Preview
        setPreviewMode: (mode) => set({ previewMode: mode }),
        setDiffViewMode: (mode) => set({ diffViewMode: mode }),
        
        // Search
        addToSearchHistory: (query) => {
          const { searchHistory, maxSearchHistory } = get();
          if (!query.trim() || searchHistory.includes(query)) return;
          
          const newHistory = [query, ...searchHistory].slice(0, maxSearchHistory);
          set({ searchHistory: newHistory });
        },
        
        clearSearchHistory: () => set({ searchHistory: [] }),
        
        // Notifications
        addNotification: (notification) => {
          const id = Math.random().toString(36).substr(2, 9);
          const newNotification = {
            ...notification,
            id,
            timestamp: Date.now(),
          };
          
          set(state => ({
            notifications: [newNotification, ...state.notifications],
          }));
          
          // Auto-hide notification if specified
          if (notification.autoHide !== false) {
            const duration = notification.duration || 5000;
            setTimeout(() => {
              get().removeNotification(id);
            }, duration);
          }
        },
        
        removeNotification: (id) => {
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== id),
          }));
        },
        
        clearNotifications: () => set({ notifications: [] }),
        
        // Computed values
        getEffectiveTheme: () => {
          const { theme } = get();
          if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }
          return theme;
        },
        
        getEditorTheme: () => {
          const { editorTheme } = get();
          const effectiveTheme = get().getEffectiveTheme();
          
          // Auto-switch editor theme based on UI theme
          if (editorTheme === 'vs-light' && effectiveTheme === 'dark') {
            return 'vs-dark';
          }
          if (editorTheme === 'vs-dark' && effectiveTheme === 'light') {
            return 'vs-light';
          }
          
          return editorTheme;
        },
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          previewPanelVisible: state.previewPanelVisible,
          previewPanelSize: state.previewPanelSize,
          editorFontSize: state.editorFontSize,
          editorWordWrap: state.editorWordWrap,
          editorLineNumbers: state.editorLineNumbers,
          editorMinimap: state.editorMinimap,
          editorTheme: state.editorTheme,
          previewMode: state.previewMode,
          diffViewMode: state.diffViewMode,
          searchHistory: state.searchHistory,
        }),
      }
    ),
    {
      name: 'ui-store',
      enabled: typeof process !== 'undefined' && process.env.NODE_ENV === 'development',
    }
  )
);

// Theme effect hook
export const useThemeEffect = () => {
  const theme = useUiStore(state => state.theme);
  const getEffectiveTheme = useUiStore(state => state.getEffectiveTheme);
  
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme();
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
    
    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, getEffectiveTheme]);
};

// Selectors
export const useTheme = () => useUiStore(state => ({
  theme: state.theme,
  effectiveTheme: state.getEffectiveTheme(),
  setTheme: state.setTheme,
}));

export const useLayout = () => useUiStore(state => ({
  sidebarCollapsed: state.sidebarCollapsed,
  previewPanelVisible: state.previewPanelVisible,
  previewPanelSize: state.previewPanelSize,
  toggleSidebar: state.toggleSidebar,
  togglePreviewPanel: state.togglePreviewPanel,
  setPreviewPanelSize: state.setPreviewPanelSize,
}));

export const useEditorPreferences = () => useUiStore(state => ({
  fontSize: state.editorFontSize,
  wordWrap: state.editorWordWrap,
  lineNumbers: state.editorLineNumbers,
  minimap: state.editorMinimap,
  theme: state.getEditorTheme(),
  setFontSize: state.setEditorFontSize,
  setWordWrap: state.setEditorWordWrap,
  setLineNumbers: state.setEditorLineNumbers,
  setMinimap: state.setEditorMinimap,
  setTheme: state.setEditorTheme,
}));

export const useNotifications = () => useUiStore(state => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));