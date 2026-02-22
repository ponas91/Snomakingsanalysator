/**
 * Vite-konfigurasjon for Snøklar
 * 
 * Vite er en moderne byggeverktøy for frontend-prosjekter.
 * Den erstatter Webpack og har innebygd støtte for:
 * - Hot Module Replacement (HMR) - oppdaterer kode uten full reload
 * - Automatisk bundling av dependencies
 * - Optimering for produksjon
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Hovedkonfigurasjonen for Vite
 * 
 * plugins: Eksterne pakker som utvider Vite sin funksjonalitet
 * - react(): Støtte for React-komponenter (JSX, Fast Refresh)
 * - tailwindcss(): Støtte for Tailwind CSS
 * - VitePWA(): Gjør appen til en Progressive Web App (PWA)
 */
export default defineConfig({
  /**
   * Plugins som brukes i prosjektet
   * 
   * @see https://vite.dev/plugins/ - Offisielle Vite-plugins
   * @see https://github.com/vitejs/vite-plugin-react - React-støtte
   * @see https://github.com/vitejs/vite-plugin-plugin-pwa - PWA-støtte
   */
  plugins: [
    // React-plugin: Gir støtte for JSX/TSX og Hot Module Replacement for React
    react(), 
    
    // Tailwind CSS v4: Automatisk genererer CSS fra Tailwind-klasser
    tailwindcss(),
    
    /**
     * VitePWA: Gjør appen installérbar på enheter
     * 
     * Konfigurasjon:
     * - registerType: 'autoUpdate' - Service worker oppdaterer automatisk
     * - includeAssets: Filer som skal inkluderes i PWA-bundlet
     * - manifest: App-manifest som beskriver appen til operativsystemet
     * 
     * @see https://vite-pwa-org.netlify.app/ - Full PWA-dokumentasjon
     */
    VitePWA({
      // Auto-update: Automatisk last ned nye versjoner av appen
      registerType: 'autoUpdate',
      
      // Filer som skal inkluderes i PWA-ressursene
      // Disse caches av service worker for offline-støtte
      includeAssets: ['pwa-192x192.svg', 'pwa-512x512.svg'],
      
      /**
       * Web App Manifest
       * 
       * Dette er en JSON-fil som forteller operativsystemet
       * hvordan appen skal se ut og oppføre seg når den er installert.
       */
      manifest: {
        // Fullt navn - vises i app-lanseringen
        name: 'Snøklar',
        
        // Kort navn - vises under app-ikonet på hjemmeskjermen
        short_name: 'Snøklar',
        
        // Beskrivelse av appen
        description: 'Følg med på snøvarsling og bestill brøyting',
        
        // Theme-farge: Fargen på statuslinjen og task switcheren
        theme_color: '#1e293b',
        
        // Bakgrunnsfarge: Vises mens appen lastes
        background_color: '#1e293b',
        
        // Display-modus: 'standalone' = appen kjører uten nettleser-grensesnitt
        display: 'standalone',
        
        // Retning: 'portrait' for mobil, 'landscape' for brett
        orientation: 'portrait',
        
        // Start-URL: Hvilken side som åpnes når appen starter
        start_url: '/',
        
        // Scope: Hvilke URL-er som regnes som del av appen
        scope: '/',
        
        /**
         * Ikoner for appen
         * 
         * Kreves for PWA-installasjon på ulike enheter:
         * - 192x192: Android, Windows
         * - 512x512: iOS, Android, som maskable (tilpasser seg ulike former)
         * 
         * purpose: 'any' = vanlig ikon
         * purpose: 'maskable' = ikon med transparante hjørner som fyller hele sirkelen
         */
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'maskable'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  
  /**
   * Build-konfigurasjon
   * 
   * Denne seksjonen bestemmer hvordan produksjons-bundlet blir bygget.
   */
  build: {
    /**
     * Rollup-konfigurasjon
     * 
     * Rollup er bundleren som pakker alle filer til én eller flere JS-filer.
     * 
     * @see https://rollupjs.org/ - Rollup-dokumentasjon
     */
    rollupOptions: {
      output: {
        /**
         * Manuelle chunks
         * 
         * Deler koden i separate filer for bedre caching.
         * React endrer seg sjelden, så den pakkes i egen fil.
         * Recharts er et stort bibliotek, pakkes også separat.
         * 
         * Resultat i dist/:
         * - index.js (~220KB) - App-kode
         * - vendor-react.js (~0KB) - React (lite pga optimalisering)
         * - vendor-recharts.js (~350KB) - Recharts-biblioteket
         */
        manualChunks: {
          // React og React DOM i én chunk - lastes én gang og caches
          'vendor-react': ['react', 'react-dom'],
          
          // Recharts i egen chunk - biblioteket er stort
          'vendor-recharts': ['recharts'],
        }
      }
    }
  }
})
