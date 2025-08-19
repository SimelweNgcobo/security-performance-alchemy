import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          supabase: ['@supabase/supabase-js'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          // Admin chunk (separate heavy admin components)
          admin: [
            './src/pages/AdminPanel.tsx',
            './src/pages/AdminAuth.tsx',
            './src/components/admin/OrdersManagement.tsx',
            './src/components/admin/ProductsManagement.tsx',
            './src/components/admin/CustomersManagement.tsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'esbuild'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js', 'react-router-dom'],
    exclude: ['@vite/client', '@vite/env']
  }
}));
