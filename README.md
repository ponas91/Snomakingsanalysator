# Snømåkingsanalysator

En web-applikasjon for å overvåke snøvarsling og koordinere brøyting med entreprenør.

## Funksjonalitet

- **Værdata**: Automatisk henting fra Met.no API (Meteorologisk institutt)
- **Snøprognose**: 24-timers prognose med grafisk fremstilling
- **Varslingsstatus**: Fargekodet status (grønn/gul/rød) basert på konfigurerbar terskel
- **Brøytingshistorikk**: Logg over når det er brøytet (lagres i 6 måneder)
- **Entreprenørkontakt**: Direkte ring/SMS til entreprenør
- **PWA-støtte**: Kan installeres som app på PC, mobil og nettbrett

## Teknisk stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Vær-API**: Met.no Forecast API
- **Charting**: Recharts

## Komme i gang

### Forutsetninger

- Node.js 18+

### Installering

```bash
npm install
```

### Utvikling

```bash
npm run dev
```

Appen kjører på http://localhost:5173/

### Produksjon

```bash
npm run build
```

Deploy `dist`-mappen til en webserver.

## Innstillinger

- **Lokasjon**: Sett bredde- og lengdegrad for ønsket sted
- **Snøterskel**: Varsling ved X cm snø (default: 10 cm)
- **Varsling**: Aktiver/deaktiver for dagtid og natt

## Datakilder

- Værdata: [Met.no](https://www.met.no/) (Meteorologisk institutt)
- Visualisering: [Pent.no](https://pent.no/)

## Lisens

MIT
