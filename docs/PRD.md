# Bright Light Solutions - Produktkravsdokument (PRD)

## Projektöversikt

**Projekt:** Bright Light Solutions - Projektledningssimulering
**Beskrivning:** Interaktiv simulering där studentgrupper leder ett förbättringsprojekt genom fyra faser med Gate-godkännanden.
**Tech Stack:** Next.js 14, React 18, Tailwind CSS, Anthropic Claude API, Vercel Postgres
**Deployment:** Vercel

---

## Kontext

### Företaget
- **Namn:** Bright Light Solutions AB
- **Bransch:** LED-armaturtillverkning
- **Problem:** Reklamationer ökat från 412 (2023) till 847 (2024), kostnad 4,8 MSEK
- **Mål:** Minska reklamationskostnader med 50% inom 12 månader
- **Projektbudget:** 800 000 SEK
- **Tidsram:** 6 månader

> **VIKTIGT:** Rotorsakerna är OKÄNDA vid projektstart — studenterna måste utreda dem via intervjuer och dataanalys.

---

## Fyrfasmodell med Gate-godkännanden

Simuleringen använder en fyrfasig projektmodell. Varje fas avslutas med en Gate som kräver lärargodkännande.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   FAS 1      │     │   FAS 2      │     │   FAS 3      │     │   FAS 4      │
│ Projekt-     │     │ Projektplan  │     │ Utredning    │     │ Redovisning  │
│ definition   │     │              │     │              │     │              │
│              │     │ - WBS        │     │ - Intervjuer │     │ - Åtgärds-   │
│ - Mål/Syfte  │     │ - Gantt      │     │ - 7QC/7QM    │     │   matris     │
│ - Omfattning │     │ - Intressent │     │ - 5 Varför   │     │ - Resultat-  │
│ - Kriterier  │     │ - Riskanalys │     │ - Förslag    │     │   beräkning  │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                     │                     │                     │
    GATE 1               GATE 2               GATE 3               GATE 4
  (Direktiv)          (Projektplan)        (Utredning)          (Slutrapport)
       │                     │                     │                     │
       └─────────────────────┴─────────────────────┴─────────────────────┘
                        Lärargodkännande vid varje Gate
```

### Fas 1: Projektdefinition
- **Mål:** Definiera utredningsprojektets mål, syfte, omfattning och framgångskriterier
- **Delfaser:** Intro → Förstudie → Planering → Genomförande → Avslut
- **Leverans:** Projektdirektiv
- **Gate 1:** Läraren godkänner projektdirektivet

### Fas 2: Projektplan
- **Mål:** Planera utredningsarbetet med WBS, Gantt, intressentanalys, riskanalys
- **Verktyg:** WBS, Gantt-schema (med Gate-milstolpar), Intressentanalys, Riskanalys
- **Gate 2:** Läraren godkänner projektplanen

### Fas 3: Utredning
- **Mål:** Genomföra intervjuer, analysera data, identifiera rotorsaker, föreslå åtgärder
- **Verktyg:** Intervjusystem (AI-drivet), 7 QC-verktyg, 7 QM-verktyg, 5 Varför, Åtgärdsförslag
- **Krav:** Minst 6 intervjuer genomförda
- **Gate 3:** Läraren godkänner utredningsrapporten

### Fas 4: Redovisning
- **Mål:** Presentera åtgärdsplan med kostnader och förväntade besparingar
- **Verktyg:** Åtgärdsmatris, Resultatberäkning
- **Krav:** Minst 3 åtgärdsförslag som täcker >50% av kostnaden
- **Gate 4:** Läraren godkänner slutredovisningen → Fireworks!

---

## Roller

### Ledning
| ID | Namn | Titel | Projektroll | Hållning |
|----|------|-------|-------------|----------|
| maria | Maria Ek | VD | Projektsponsor | Stödjande |
| anna | Anna Berg | Ekonomichef | Styrgrupp/Budget | Neutral |
| henrik | Henrik Wallin | Styrelserepresentant | Ägare | Krävande |

### Operativ
| ID | Namn | Titel | Projektroll | Hållning |
|----|------|-------|-------------|----------|
| karin | Karin Lindström | Kvalitetschef | Projektägare | Engagerad |
| thomas | Thomas Gren | Inköpschef | Berörd intressent | Defensiv |
| mikael | Mikael Ström | Produktionschef | Resursägare | Skeptisk |
| peter | Peter Holm | HR-chef | Stödfunktion | Stödjande |
| jonas | Jonas Holm | Produktutvecklingschef | Teknisk expert | Neutral |

### Golvet
| ID | Namn | Titel | Projektroll | Hållning |
|----|------|-------|-------------|----------|
| kenneth | Kenneth Johansson | Lödoperatör (dagskift) | Informant | Öppen |
| emma | Emma Lindqvist | Testoperatör (kvällsskift) | Informant | Frustrerad |
| linda | Linda Bergqvist | Facklig representant | Bevakare | Bevakande |

### Externa (Låses upp i Fas 3)
| ID | Namn | Titel | Projektroll | Hållning |
|----|------|-------|-------------|----------|
| anders | Anders Krantz | JUKI-tekniker/utbildare | Extern expert | Hjälpsam |

---

## Kunskapsmodell

Varje roll har tre kunskapsnivåer:
- **Surface** — Ges fritt vid grundläggande frågor
- **Deeper** — Kräver bra, riktade frågor
- **Hidden** — Kräver upprepade, insiksfulla frågor eller att studenten redan visar kunskap

Roller refererar till varandra (`refersTo`) för att guida studenterna i vilka de bör prata med härnäst.

---

## Datakällor

### Excel-datafiler (5 st)
Genereras dynamiskt med mönster som stödjer rotorsaksupptäckt:
1. **Reklamationer** — Klustrade efter produkt, tid, skift, leverantör
2. **Produktion** — Felfrekvens per skift och linje
3. **Leverantörer** — MTBF-jämförelse ElektroTech vs AsiaCore
4. **Ekonomi** — Kostnad per reklamationstyp, besparingshistorik
5. **Personal** — Omsättning dag/kväll, utbildningsnivå

### Interna dokument (6 st)
- Organisationsschema (Maria)
- Skiftloggbok (Mikael, Kenneth)
- Utbildningsplan JUKI (Mikael)
- Skiftloggbok utdrag (Kenneth)
- Processkarta (Mikael)
- AsiaCore-mejl (Thomas, kräver bra frågor)

---

## Kvalitetsverktyg

### 7 QC-verktyg (Fas 3)
1. Datainsamlingsblad (Checksheet)
2. Histogram
3. Paretodiagram
4. Orsak-verkan (Ishikawa) — Flera diagram möjliga
5. Spridningsdiagram (Scatter)
6. Styrdiagram (Control Chart)
7. Stratifiering

### 7 QM-verktyg (Fas 3)
1. Affinitetsdiagram
2. Relationsdiagram
3. Träddiagram
4. Matrisdiagram
5. Pildiagram (Arrow)
6. PDPC
7. Prioriteringsmatris

### 5 Varför (Fas 3)
Interaktiv 5 Varför-analys med problem, fem varför-nivåer och rotorsak.

---

## Lärarportal

### Dashboard
- Översikt alla grupper med Gate-status
- Sök på gruppnamn, kod eller studentnamn
- Statistik: grupper totalt, väntar godkännande, avslutade

### Gruppdetalj
Flikar per Gate:
- **Gate 1:** Projektdirektiv med godkänn/avslå-knappar
- **Gate 2:** Projektplan med intervju/nedladdningsstatistik
- **Gate 3:** Utredning med använda analysverktyg (7QC/7QM-badges), 5 Varför, utredningsrapport
- **Gate 4:** Åtgärdsmatris med totalkostnader och besparingar

Extra flikar: Intervjuer, Data, Aktivitetslogg

---

## Tekniska krav

- Responsiv design (mobil och desktop)
- Automatisk sparning till databas
- Self-healing: fas korrigeras automatiskt baserat på gate-status
- Safety nets: dubbla godkännandesystem (submit/approve + submit-gate/approve-gate) synkroniserade
- localStorage för verktygsdata (7QC/7QM) med pipeline till databas vid Gate-inlämning
- Export till PDF/Excel/DOCX/PPTX
- Anthropic Claude API för AI-drivna intervjuer

---

*Senast uppdaterad: 2025-01-27*
