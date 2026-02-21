# Supabase-oppsett for Snømåkingsanalysator

Denne guiden beskriver hvordan du setter opp Supabase som backend for appen.

---

## 1. Opprett Supabase-prosjekt

1. Gå til [supabase.com](https://supabase.com) og opprett konto
2. Klikk "New project"
3. Fyll inn:
   - **Name**: Snømåkingsanalysator
   - **Database password**: Velg et sterkt passord
   - **Region**: Velg nærmeste (f.eks. Stockholm)
4. Vent på at prosjektet opprettes (~2 minutter)

---

## 2. Sett opp databasen

1. Gå til **SQL Editor** i Supabase-menyen
2. Kopier og lim inn hele innholdet i filen `SUPABASE_SETUP.sql`
3. Klikk **Run** for å kjøre SQL-en

---

## 3. Hent API-nøkler

1. Gå til **Project Settings** (tannhjul-ikonet) → **API**
2. Kopier:
   - **Project URL** → brukes som `VITE_SUPABASE_URL`
   - **anon public** (under "Project API keys") → brukes som `VITE_SUPABASE_ANON_KEY`

---

## 4. Legg til miljøvariabler

Opprett en fil `.env` i prosjektets rotmappe:

```env
VITE_SUPABASE_URL=https://ditt-projekt-ref.supabase.co
VITE_SUPABASE_ANON_KEY=din-anon-key
```

**Obs**: Erstatt med dine faktiske verdier fra Supabase.

---

## 5. Installer avhengigheter

```bash
npm install @supabase/supabase-js
```

---

## 6. Kjør migrering (valgfritt)

Hvis du har eksisterende data i localStorage som du vil flytte til Supabase:

1. Kjør appen i dev-modus: `npm run dev`
2. Åpne browser console
3. Skriv: `migrateToSupabase()`
4. Data migreres til Supabase

---

## 7. Autentisering (valgfritt for fremtiden)

Supabase støtter:
- **E-post/passord**
- **Google**
- **Facebook**
- **Anonoym** (allerede implementert)

For å legge til ekte autentisering senere, se Supabase Auth-dokumentasjon.

---

## Arkitektur

```
┌─────────────────────────────────────────────────┐
│                 Snømåkingsanalysator           │
│                   (Frontend)                   │
├─────────────────────────────────────────────────┤
│  src/lib/                                       │
│  ├── supabase.ts  - Supabase-klient           │
│  ├── userId.ts    - Anonym bruker-ID           │
│  └── api.ts       - API-funksjoner             │
├─────────────────────────────────────────────────┤
│                 Supabase (Backend)             │
│  ├── contractors   - Kontakter                 │
│  ├── plow_entries  - Brøytingshistorikk        │
│  └── settings      - Brukerinnstillinger        │
└─────────────────────────────────────────────────┘
```

---

## Problemer?

- Sjekk at `.env` er korrekt
- Sjekk at RLS-policies er aktivert
- Sjekk Supabase-loggene i Dashboard → Logs
