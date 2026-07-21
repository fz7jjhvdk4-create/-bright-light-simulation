# Bright Light Solutions - Projektledningssimulering

Interaktiv webbaserad simulering för högskole- och universitetsutbildning i projektledning och kvalitetsstyrning. Studentgrupper arbetar som konsulter för att utreda och åtgärda kvalitetsproblem hos en fiktiv LED-armaturtillverkare.

## Snabbstart

- **Live-app:** https://bright-light-simulation.vercel.app
- **Lärarportal:** https://bright-light-simulation.vercel.app/teacher (lösenordet sätts via miljövariabeln `TEACHER_PASSWORD` i Vercel)

## Översikt

Simuleringen guidar studentgrupper genom ett fyrafasigt konsultprojekt med Gate-godkännanden:

```
Fas 1                Fas 2              Fas 3              Fas 4
Projektdefinition    Projektplan        Utredning          Redovisning
      |                   |                  |                  |
   Gate 1 ──────────> Gate 2 ──────────> Gate 3 ──────────> Gate 4
   (Godkänn           (Godkänn           (Godkänn           (Godkänn
    direktiv)          projektplan)       utredning)         slutrapport)
```

Varje Gate kräver lärargodkännande för att låsa upp nästa fas.

### Fasernas innehåll

| Fas | Innehåll | Verktyg |
|-----|----------|---------|
| 1. Projektdefinition | Definiera mål, syfte, omfattning, framgångskriterier | Projektdefinition |
| 2. Projektplan | Planera utredningsarbetet | WBS, Gantt-schema, Intressentanalys, Riskanalys |
| 3. Utredning | Intervjua roller, analysera data, identifiera rotorsaker | Intervjuer, 7QC-verktyg, 7QM-verktyg, 5 Varför, Åtgärdsförslag |
| 4. Redovisning | Presentera åtgärdsplan med kostnad/besparing | Åtgärdsmatris, Resultatberäkning |

### Rollsystem

12 intervjubara roller fördelade på fyra kategorier:
- **Ledning:** Maria (VD), Anna (Ekonomichef), Henrik (Styrelserepresentant)
- **Operativ:** Karin (Kvalitetschef), Thomas (Inköpschef), Mikael (Produktionschef), Peter (HR-chef), Jonas (Produktutvecklingschef)
- **Golvet:** Kenneth (Lödoperatör dagskift), Emma (Testoperatör kvällsskift), Linda (Facklig representant)
- **Externa:** Anders (JUKI-tekniker, låses upp i Fas 3)

Intervjuer drivs av Claude AI och rollerna avslöjar information baserat på hur bra frågor studenterna ställer.

### Datafiler (Excel)

Fem datafiler tillgängliga för nedladdning:
- **Reklamationer** — 847 reklamationer 2023–2025
- **Produktion** — Produktionsstatistik per linje, skift, operatör
- **Leverantörer** — Jämförelse ElektroTech vs AsiaCore
- **Ekonomi** — Kostnadsfördelning, ROI-beräkningar
- **Personal** — Personalomsättning per skift, utbildningsnivå

### Interna dokument

Dokument som roller kan dela vid intervju:
- Organisationsschema (via Maria)
- Skiftloggbok (via Mikael/Kenneth)
- Utbildningsplan JUKI (via Mikael)
- Processkarta (via Mikael)
- AsiaCore-mejl (via Thomas, kräver bra frågor)

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS
- **Backend:** Next.js API Routes, Vercel Postgres
- **AI:** Anthropic Claude API (sdk v0.71)
- **Export:** xlsx, jspdf, html2canvas, docx, pptxgenjs
- **Deployment:** Vercel

## Lokal utveckling

### Förutsättningar
- Node.js 18+
- npm
- Vercel Postgres-databas
- Anthropic API-nyckel

### Installation

```bash
git clone https://github.com/fz7jjhvdk4-create/-bright-light-simulation.git
cd bright-light-simulation
npm install
```

### Miljövariabler

Skapa `.env.local`:

```env
# Vercel Postgres
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NO_SSL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Lärarportalen (välj ett eget starkt lösenord)
TEACHER_PASSWORD=...
```

### Starta utvecklingsserver

```bash
npm run dev
```

Appen körs på http://localhost:3000.

### Deploya till Vercel

```bash
vercel --prod
```

## Projektstruktur

```
src/
  app/
    page.tsx                          # Startsida (registrering/inloggning)
    simulation/[code]/page.tsx        # Huvudsimulering (student)
    teacher/
      page.tsx                        # Lärarinloggning
      dashboard/page.tsx              # Läraröversikt alla grupper
      group/[code]/page.tsx           # Gruppdetaljer med Gate-flikar
    api/
      groups/[code]/
        route.ts                      # Hämta/uppdatera grupp
        submit/route.ts               # Skicka in för godkännande
        approve/route.ts              # Lärargodkännande
        submit-gate/route.ts          # Gate-specifik inlämning
        approve-gate/route.ts         # Gate-specifikt godkännande
        proposals/route.ts            # Åtgärdsförslag CRUD
        investigation-tools/route.ts  # 7QC/7QM/5Why-data
        investigation-report/route.ts # Utredningsrapport
        project-definition/route.ts   # Projektdefinition
        log-activity/route.ts         # Aktivitetslogg
      chat/route.ts                   # AI-chattendpoint
      data/[type]/route.ts            # Datafiler (Excel)
  components/
    QualityTools7QC.tsx               # 7 QC-verktyg (Ishikawa, Pareto m.m.)
    QualityTools7QM.tsx               # 7 QM-verktyg (Affinitet, Träddiagram m.m.)
    ActionProposals.tsx               # Åtgärdsförslag
    GanttChart.tsx                    # Gantt-schema
    RiskAnalysis.tsx                  # Riskanalys
    WBS.tsx                           # Work Breakdown Structure
  lib/
    db.ts                             # Databasanslutning och queries
    roles.ts                          # 12 rolldefinitioner
    documents.ts                      # Interna dokument
    root-causes.ts                    # 5 rotorsaker och poängberäkning
    data-generator.ts                 # Excel-datagenerering
```

## Databas

Vercel Postgres med följande tabeller:

| Tabell | Beskrivning |
|--------|-------------|
| `groups` | Grupper med fas, gate-status, sub_phase |
| `interviews` | Genomförda intervjuer |
| `downloads` | Nedladdade datafiler |
| `activity_log` | Aktivitetslogg |
| `proposals` | Åtgärdsförslag |
| `project_definitions` | Projektdefinitioner |
| `investigation_reports` | Utredningsrapporter |
| `investigation_tools_data` | 7QC/7QM/5Why-analysdata |
| `document_views` | Visade dokument |

## Säkerhet

- API-nycklar lagras som miljövariabler i Vercel — aldrig i koden
- `.env.local` finns i `.gitignore`
- Lärarportalen skyddas med lösenord (`TEACHER_PASSWORD`) som verifieras på servern;
  sessionen lagras i en httpOnly-cookie och alla lärar-API:er vaktas av `src/proxy.ts`
- AI-endpoints kräver giltig gruppkod; chatthistorik byggs på servern från databasen
- Skrivande endpoints validerar att gruppen är i rätt fas

## Kostnad

- **Vercel:** Gratis (Hobby-plan)
- **Claude API:** ~$0.01–0.03 per studentkonversation
- 100 studenter x 5 konversationer ≈ $5–15

## Dokumentation

Se `docs/`-mappen för:
- [Lärarhandledning](docs/Lararhandledning.md) — Setup, genomförande, bedömning
- [Studentinstruktion](docs/Studentinstruktion.md) — Så här arbetar ni med simuleringen
- [Lösningsförslag](docs/Losningsforslag.md) — Rotorsaker och förväntade åtgärder
- [PRD](docs/PRD.md) — Produktkravsdokument
