# Kvalitet Board · DB Dashboard

Et selvstændigt GitHub-projekt til at visualisere dækningsbidrag (DB) ved at kombinere:

- **kundeomsætning fra Dinero**
- **timelønnet forbrug fra Smartplan**

Målet er at give et hurtigt ledelsesoverblik over hvilke kunder, kundegrupper eller perioder der leverer sund DB – og hvor timeforbrug eller manglende fakturering presser marginen.

## Projektindhold

Projektet er bevidst holdt simpelt som et selvstændigt frontend-proof-of-concept:

- `index.html` loader appen
- `src/app.js` renderer dashboardet med mock-data
- `src/styles.css` indeholder layout og styling
- `package.json` giver enkle scripts til lokal kørsel og syntakscheck

## Lokal kørsel

```bash
npm run start
```

Åbn derefter `http://localhost:4173` i browseren.

## Validering

```bash
npm run check
```

## Næste oplagte udvidelser

1. Tilføj rigtig API-integration til Dinero.
2. Tilføj rigtig API- eller eksportintegration til Smartplan.
3. Gem matchede data i et mellemled, fx SQLite/Postgres eller et ETL-flow.
4. Tilføj filtre for kunde, periode, afdeling og ansvarlig planlægger.
5. Tilføj alarmer for kunder under ønsket DB%.
