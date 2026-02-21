# AGENTS.md - Developer Guide for Snømåkingsanalysator

This file provides guidelines for AI agents working on this codebase.

---

## 1. Build, Lint, and Test Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:5173/)
npm run preview      # Preview production build
```

### Building
```bash
npm run build        # TypeScript compile + Vite build → outputs to dist/
```

### Linting
```bash
npm run lint         # Run ESLint on entire project
```

### No test framework
This project does not currently have a test framework set up. If adding tests, use Vitest.

---

## 2. Project Structure

```
src/
├── components/      # React components (one file per component)
├── context/         # React Context (AppContext.tsx)
├── hooks/           # Custom React hooks (useApp.ts, useLocalStorage.ts)
├── services/        # API services (metno.ts, geocoding.ts, notifications.ts)
├── types/           # TypeScript interfaces and types (index.ts)
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Tailwind CSS entry
```

---

## 3. Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define types in `src/types/index.ts`
- Use interfaces for objects, types for unions/primitives
- Avoid `any` - use `unknown` if necessary

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `SnowStatusCard.tsx` |
| Hooks | camelCase, prefix `use` | `useApp.ts` |
| Interfaces | PascalCase | `SnowEntry` |
| Functions | camelCase | `fetchWeatherData()` |
| Variables | camelCase | `snowDepth` |
| CSS Classes | Tailwind (kebab-case in HTML) | `bg-slate-800` |

### Imports
```typescript
// Order: 1. React 2. External libs 3. Internal modules
import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import type { SnowEntry } from '../types';
import { fetchWeatherData } from '../services/metno';
```

- Use absolute paths from `src/` when possible (e.g., `../types`)
- Avoid relative paths deeper than 2 levels (use index exports)

### Components
- Export as named export: `export function ComponentName()`
- One component per file
- Use functional components with hooks
- Colocate related types in component file if only used there

### Error Handling
- Use try/catch for async operations
- Set error state in context: `dispatch({ type: 'SET_ERROR', payload: error.message })`
- Display errors to user via UI components

### React Context
- Use AppContext for global state (settings, weather, history, contractors)
- Follow reducer pattern: actions in `AppAction` type
- Use `useApp()` hook to access context

---

## 4. Tailwind CSS Usage

This project uses Tailwind CSS v4 with `@tailwindcss/vite` plugin.

### Classes
- Use utility classes for all styling
- Prefer semantic color names: `text-slate-300`, `bg-blue-600`
- Use responsive prefixes: `md:`, `lg:` (minimal usage - mobile-first)
- Custom animations in `index.css` if needed

### Colors (High-contrast Slate + Sky Blue theme)
- Background: `bg-slate-950` (main), `bg-slate-900` (cards), `bg-slate-800` (inputs)
- Text: `text-white` (primary), `text-slate-200/300` (secondary), `text-slate-400` (muted)
- Accents: `sky-500/sky-600` (primary), `green-500`, `red-500`, `yellow-500` (status)

---

## 5. API Integration

### Weather Data
- Uses Met.no API (Meteorologisk institutt)
- Service: `src/services/metno.ts`
- Functions: `fetchWeatherData(lat, lon)`, `calculateSnowInPeriod()`
- Includes coordinate validation before API calls

### Geocoding
- Uses OpenStreetMap Nominatim API
- Service: `src/services/geocoding.ts`
- Function: `searchPlaces(query)`
- Includes coordinate validation and `isValidCoordinate()` export

### Notifications
- Uses Browser Notifications API
- Service: `src/services/notifications.ts`
- Functions: `requestNotificationPermission()`, `showNotification()`, `isDayTime()`, `isNightTime()`
- Always wrap Notification constructor in try-catch to prevent crashes on unsupported browsers

---

## 6. State Management

### Local State
- Use `useState` for component-local state
- Use `useEffect` for side effects

### Global State (AppContext)
Managed via reducer in `AppContext.tsx`:
- `settings` - User preferences
- `weather` - Current weather data
- `history` - Plow log entries
- `contractors` - Contact list
- `loading` / `error` - UI states
- `lastNotifiedSnow` - Notification throttling

### Persistence
Currently uses `localStorage`. See `SUPABASE_GUIDE.md` for future Supabase integration.

---

## 7. PWA Configuration

- Uses `vite-plugin-pwa` with auto-update
- Config: `vite.config.ts`
- Service worker handles offline capability
- Update notification component: `src/components/PWAUpdate.tsx`

---

## 8. Important Patterns

### Forms
```typescript
// Use controlled inputs with state
const [value, setValue] = useState('');
const handleChange = (e) => setValue(e.target.value);

// Form submission
const handleSubmit = (e) => {
  e.preventDefault();
  // process form
};
```

### Conditional Rendering
```typescript
// Early return for null states
if (!data) return null;

// Conditional content
{condition && <Component />}
```

### Async Operations
```typescript
// With loading state
const handleAction = async () => {
  dispatch({ type: 'SET_LOADING', payload: true });
  try {
    const data = await fetchData();
    dispatch({ type: 'SET_DATA', payload: data });
  } catch (error) {
    dispatch({ type: 'SET_ERROR', payload: error.message });
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};
```

---

## 9. Adding New Features

1. **Types**: Add interfaces/types in `src/types/index.ts`
2. **API**: Add service functions in appropriate file under `src/services/`
3. **Components**: Create new component in `src/components/`
4. **State**: Add action types to `AppAction` union and handle in reducer
5. **UI**: Add component to appropriate tab in `App.tsx`

---

## 10. Known Configuration

- Vite 7.x with React 19
- Tailwind CSS 4.x
- ESLint 9.x (flat config)
- TypeScript ~5.9
- No test framework (Vitest recommended if tests added)

---

## 11. Supabase Integration (Planned)

See `SUPABASE_GUIDE.md` and `SUPABASE_SETUP.sql` for database schema.
When implementing, add `@supabase/supabase-js` dependency.
