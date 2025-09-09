import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://cacheflow:8000';
  console.log(`Using proxy target: ${proxyTarget}`);
  
  return {
    plugins: [react()],
    preview: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts: ['dev-caching-editor.pscx.ai']
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: ['dev-caching-editor.pscx.ai'],
      proxy: {
        '/admin': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
