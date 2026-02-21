/**
 * Versjonsinformasjon for appen
 * 
 * Versjonen hentes automatisk fra package.json via Vite.
 * 
 * @example
 * console.log(VERSION); // "1.0.0"
 * console.log(BUILD_DATE); // "2026-02-21"
 */

export const VERSION = import.meta.env.PACKAGE_VERSION || '1.0.0';

export const BUILD_DATE = new Date().toISOString().split('T')[0];
