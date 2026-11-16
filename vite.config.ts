import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function preloadFonts(pattern: RegExp): Plugin {
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        return Object.keys(ctx.bundle ?? {})
          .filter((fileName) => pattern.test(fileName))
          .map((fileName) => ({
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${fileName}`, crossorigin: '' },
            injectTo: 'head',
          }))
      },
    },
  }
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), preloadFonts(/figtree-latin-wght-normal-[\w-]+\.woff2$/)],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: isSsrBuild
          ? true
          : {
              groups: [
                { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 50 },
                { name: 'router', test: /node_modules[\\/]react-router(-dom)?[\\/]/, priority: 40 },
                { name: 'query', test: /node_modules[\\/]@tanstack[\\/]react-query/, priority: 30 },
                { name: 'ui', test: /node_modules[\\/](@radix-ui|tslib)[\\/]/, priority: 20 },
                { name: 'supabase', test: /node_modules[\\/]@supabase[\\/]/, priority: 10 },
              ],
            },
      },
    },
  },
}))
