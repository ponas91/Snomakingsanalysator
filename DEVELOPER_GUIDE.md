# DEVELOPER_GUIDE.md

## En komplett guide for utviklere som skal jobbe med Snøklar

---

# 1. PROSJEKTOVERSIKT

## Hva appen gjør

Snøklar er en Progressive Web App (PWA) for:
- **Værvarsling**: Henter data fra Meteorologisk institutt (Met.no)
- **Snøprognose**: Viser 48-timers time-forvarsling
- **Brøytingslogg**: Logger når det er brøytet
- **Kontakter**: Holder oversikt over entreprenører
- **Varsling**: Varsler når det begynner å snø

## Teknologistack

| Teknologi | Versjon | Bruk |
|-----------|---------|------|
| React | 19.x | UI-rammeverk |
| TypeScript | ~5.9 | Typesikkerhet |
| Vite | 7.x | Byggeverktøy |
| Tailwind CSS | 4.x | Styling |
| Recharts | 3.x | Diagrammer |
| vite-plugin-pwa | 1.x | PWA-funksjonalitet |

---

# 2. KOMME I GANG

## Installering

```bash
# Klon prosjektet
git clone https://github.com/ponas91/Snoklar.git
cd Snoklar

# Installer avhengigheter
npm install
```

## Utviklingsserver

```bash
npm run dev
```

Appen kjører på http://localhost:5173/

## Produksjonsbygg

```bash
npm run build
```

Output i `dist/` mappen.

## Linting

```bash
npm run lint
```

---

# 3. ARKITEKTUR

## Mappestruktur

```
src/
├── components/           # React komponenter
│   ├── WeatherCard.tsx      # Vær nå (temperatur, vind, etc.)
│   ├── SnowStatusCard.tsx   # Snøstatus (normal/warning/critical)
│   ├── ForecastChart.tsx    # Prognose-diagram
│   ├── HistoryTable.tsx     # Brøytingslogg
│   ├── ContractorCard.tsx   # Kontakter/entreprenører
│   ├── SettingsForm.tsx     # Innstillinger
│   └── PWAUpdate.tsx        # PWA-oppdatering
│
├── context/             # React Context
│   └── AppContext.tsx      # Global state + reducer
│
├── hooks/               # Custom React hooks
│   ├── useApp.ts            # Hook for global state
│   └── useLocalStorage.ts   # Hook for localStorage
│
├── services/            # API-kall
│   ├── metno.ts             # Met.no vær-API
│   ├── geocoding.ts         # OpenStreetMap stedsøk
│   └── notifications.ts      # Browser notifications
│
├── types/              # TypeScript interfaces
│   └── index.ts             # Alle type-definisjoner
│
├── App.tsx              # Hovedkomponent
└── main.tsx             # Entry point
```

## Dataflyt

```
┌─────────────────────────────────────────────────────────┐
│                    AppContext                            │
│  (Global state + Reducer)                               │
│  ┌─────────────┬─────────────┬──────────────────────┐ │
│  │ Settings    │ Weather     │ History               │ │
│  │ Contractors │ LastNotify  │ Error/Loading        │ │
│  └─────────────┴─────────────┴──────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                                 ▼
┌───────────────────┐         ┌──────────────────────┐
│  localStorage     │         │  API-er              │
│  (Persistens)     │         │  (Met.no, OSM)      │
└───────────────────┘         └──────────────────────┘
```

---

# 4. VIKTIGE BEGREPER

## Context + Reducer

AppContext bruker Redux-lignende mønster:

```typescript
// 1. Definer state type
interface AppState {
  settings: Settings;
  weather: WeatherData | null;
  // ...
}

// 2. Definer actions
type AppAction =
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_WEATHER'; payload: WeatherData }
  // ...

// 3. Lag reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    // ...
  }
}

// 4. Bruk i komponent
const { state, dispatch } = useApp();
dispatch({ type: 'SET_SETTINGS', payload: newSettings });
```

## localStorage

Data persisters i browserens localStorage:

| Nøkkel | Data |
|--------|------|
| `snomaking_settings` | Brukerinnstillinger |
| `snomaking_history` | Brøytingslogg |
| `snomaking_contractors` | Kontakter |
| `snomaking_weather` | Cached værdata |

## API-integrasjon

### Met.no (Vær)

```typescript
import { fetchWeatherData, calculateSnowInPeriod } from './services/metno';

// Hent vær for koordinater
const weather = await fetchWeatherData(59.9139, 10.7522);

// Beregn snø de neste 24 timene
const snow24h = calculateSnowInPeriod(weather.hourly, 24);
```

### Nominatim (Stedsøk)

```typescript
import { searchPlaces } from './services/geocoding';

// Søk etter steder
const results = await searchPlaces("Oslo");
// [{ name: "Oslo", lat: 59.91, lon: 10.75, display_name: "..." }]
```

### Varslinger

```typescript
import { requestNotificationPermission, showNotification, isDayTime, isNightTime } from './services/notifications';

// Be om tillatelse
const granted = await requestNotificationPermission();

// Send varsling (wrap alltid i try-catch)
try {
  showNotification('Tittel', 'Melding');
} catch (e) {
  console.log('Varsling støttes ikke');
}

// Sjekk tid på døgnet
if (isNightTime()) {
  // Vis måne-emoji i stedet for sol
}
```

---

# 5. LEGGE TIL NY FUNKSJON

## Steg 1: Legg til type

I `src/types/index.ts`:

```typescript
export interface NewFeature {
  id: string;
  name: string;
  value: number;
}
```

## Steg 2: Legg til action

I `src/types/index.ts`:

```typescript
export type AppAction =
  | { type: 'SET_NEW_FEATURE'; payload: NewFeature }
  // ...andre actions
```

## Steg 3: Oppdater reducer

I `src/context/AppContext.tsx`:

```typescript
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_NEW_FEATURE':
      return { ...state, newFeature: action.payload };
  }
}
```

## Steg 4: Lag komponent

I `src/components/NewFeature.tsx`:

```typescript
export function NewFeature() {
  const { state, dispatch } = useApp();
  
  // Bruk state og render UI
  return <div>{state.newFeature?.name}</div>;
}
```

## Steg 5: Vis i App.tsx

```typescript
import { NewFeature } from './components/NewFeature';

// I AppContent:
{activeTab === 'newfeature' && <NewFeature />}
```

---

# 6. PWA (Progressive Web App)

## Hva er PWA?

En PWA er en nettside som kan installeres på enheten og fungere som en app.

## Installering

Appen viser en "Installer appen"-knapp i innstillinger når:
- Nettleseren støtter PWA-installasjon
- Krav oppfylles (manifest, service worker, HTTPS)

## Konfigurasjon

I `vite.config.ts`:

```typescript
VitePWA({
  registerType: 'autoUpdate',  // Auto-oppdatering
  manifest: {
name: 'Snøklar',
short_name: 'Snøklar',
    display: 'standalone',  // Kjør uten nettleser-grensesnitt
    icons: [/* ikonstørrelser */]
  }
})
```

## Oppdatering

Når ny versjon deployes:
1. Service worker oppdager ny versjon
2. Bruker ser "Ny versjon tilgjengelig"-melding
3. Klikker "Oppdater" for å laste ny versjon

---

# 7. DEPLOY

## Vercel (Anbefalt)

1. Installer Vercel CLI: `npm i -g vercel`
2. Kjør `vercel`
3. Følg instruksjonene

Eller:
1. Bygg: `npm run build`
2. Last opp `dist/` til Vercel

## Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`

---

# 8. VANLIGE PROBLEMER

## "Cannot read property of undefined"

Typisk ved feil bruk av optional chaining. Sjekk at data er lastet før bruk:

```typescript
// Feil
const temp = state.weather.current.temperature;

// Riktig
const temp = state.weather?.current?.temperature ?? 0;
```

## "useApp must be used within an AppProvider"

Hooken brukes utenfor AppProvider. Sørg for at komponenten er inni `<AppProvider>`.

## TypeScript-feil i build

Kjør `npm run build` for å se alle TypeScript-feil. Ofte løst med:

- Riktig import: `import { type T } from '...'` for kun typer
- Unngå `any` - bruk `unknown` om nødvendig

## Validering

Alle koordinater valideres før API-kall:

```typescript
import { isValidCoordinate } from './services/geocoding';

if (isValidCoordinate(lat, lon)) {
  // Gjør API-kall
}
```

Bruk funksjoner fra `src/lib/validation.ts` for input-sjekk.

## PWA-installasjon fungerer ikke på iOS

Sjekk at `index.html` har:

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="apple-touch-icon" href="/pwa-192x192.svg" />
```

## Sikkerhet

`index.html` inneholder Content Security Policy (CSP) for å beskytte mot XSS.

---

# 9. KODEKONVENSJONER

## Navngivelse

| Type | Format | Eksempel |
|------|--------|----------|
| Komponenter | PascalCase | `WeatherCard.tsx` |
| Funksjoner | camelCase | `fetchWeatherData()` |
| Variabler | camelCase | `snowDepth` |
| Interfaces | PascalCase | `WeatherData` |
| Hooks | camelCase med `use` | `useApp()` |

## Imports

Rekkefølge:
1. React
2. Eksterne biblioteker
3. Interne moduler

```typescript
import { useState } from 'react';
import { useApp } from './hooks/useApp';
import type { SnowEntry } from './types';
import { fetchWeatherData } from './services/metno';
```

## Komponenter

- Én komponent per fil
- Navngitt export: `export function ComponentName()`
- Props interface i samme fil om kun brukt der

---

# 10. SUPABASE-INTEGRASJON (FREMTIDIG)

Se `SUPABASE_GUIDE.md` for oppsett.

Kort oversikt:
1. Opprett Supabase-prosjekt
2. Kjør `SUPABASE_SETUP.sql` i SQL Editor
3. Legg til miljøvariabler
4. Installer `@supabase/supabase-js`
5. Opprett `src/lib/supabase.ts`

---

# 11. LENKER

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Met.no API](https://api.met.no/weatherapi/)
- [Nominatim](https://nominatim.org/)
