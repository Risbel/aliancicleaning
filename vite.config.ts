import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { chunkSplitPlugin } from 'vite-plugin-chunk-split'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    chunkSplitPlugin({
      strategy: 'default',
      customSplitting: {
        'react-vendor': [/node_modules[\\/]react/, /node_modules[\\/]react-dom/],
        'router': [/node_modules[\\/]react-router-dom/],
        'query': [/node_modules[\\/]@tanstack[\\/]react-query/],
        'supabase': [/node_modules[\\/]@supabase/],
        'ui': [/node_modules[\\/]@radix-ui/],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
