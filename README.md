# Snømåkingsanalysator

En web-applikasjon for å overvåke snøvarsling og koordinere brøyting med entreprenør.

## Funksjonalitet

- **Værdata**: Automatisk henting fra Met.no API (Meteorologisk institutt)
- **Snøprognose**: 24-timers prognose med grafisk fremstilling
- **Varslingsstatus**: Fargekodet status (grønn/gul/rød) basert på konfigurerbar terskel
- **Brøytingshistorikk**: Logg over når det er brøytet (lagres i 6 måneder)
- **Kontakter**: Legg til flere entreprenører/kontakter med favorittvalg
- **Direkte kontakt**: Ring/SMS til valgt kontakt
- **Automatisk oppdatering**: Henter ny værdata hvert 15. minutt og ved app-åpning
- **Stedsøk**: Søk etter steder med autocomplete (Nominatim/OpenStreetMap)
- **PWA-støtte**: Kan installeres som app på PC, mobil og nettbrett

## Teknisk stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Vær-API**: Met.no Forecast API
- **Kart/Geocoding**: OpenStreetMap (Nominatim)
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

- **Lokasjon**: Søk etter sted eller angi koordinater manuelt
- **Snøterskel**: Varsling ved X cm snø (default: 10 cm)
- **Varsling**: Aktiver/deaktiver for dagtid og natt
- **Kontakter**: Legg til, rediger eller slett entreprenører

## Datakilder

- Værdata: [Met.no](https://www.met.no/) (Meteorologisk institutt)
- Stedsøk: [OpenStreetMap](https://www.openstreetmap.org/) (Nominatim)
- Visualisering: [Pent.no](https://pent.no/)

## Lisens

MIT
