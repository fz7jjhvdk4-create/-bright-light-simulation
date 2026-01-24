# Implementeringsplan - Bright Light Solutions Simulering

## Nuläge vs Målbild

### Nuvarande implementation
- ✅ Databas och grundläggande API
- ✅ Roller och chattfunktion med AI
- ✅ Lärar-dashboard
- ✅ Grundläggande WBS, Riskanalys-komponenter (finns men används fel)
- ❌ Fel fas-ordning (intervjuer före planering)
- ❌ Saknar uppdragsmöte med Maria
- ❌ Saknar projektplaneringsverktyg i början
- ❌ Saknar delfaser inom varje fas
- ❌ Saknar händelser/konflikter i Fas 2
- ❌ Saknar resultatsimulatorn

### Målbild (enligt PRD)
1. Starta med uppdragsmöte → Planering → Sen intervjuer
2. Två godkännanden i Fas 1 (projektplan + utredning)
3. Komplett Fas 2 med händelser och resultat

---

## Implementeringsfaser

### Sprint 1: Dokumentation och databasändringar ✅ PÅGÅENDE
**Uppskattad tid:** 1 dag

- [x] Spara PRD.md
- [x] Skapa implementeringsplan
- [ ] Uppdatera databasschema för delfaser
- [ ] Lägga till fält för projektplan-data

**Databasändringar:**
```sql
-- Lägg till delfas-tracking
ALTER TABLE groups ADD COLUMN sub_phase VARCHAR(30) DEFAULT 'idea';
-- Möjliga värden: idea, prestudy, planning, execution, closing

-- Lägg till projektplan-godkännande
ALTER TABLE groups ADD COLUMN project_plan_approved BOOLEAN DEFAULT FALSE;

-- Tabell för projektdefinition
CREATE TABLE project_definitions (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  purpose TEXT,
  goals TEXT,
  scope TEXT,
  exclusions TEXT,
  success_criteria TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabell för intressentanalys
CREATE TABLE stakeholder_analysis (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  stakeholder_id VARCHAR(20),
  influence INTEGER,  -- 1-5
  interest INTEGER,   -- 1-5
  strategy TEXT,
  priority INTEGER
);

-- Tabell för Gantt-aktiviteter
CREATE TABLE gantt_activities (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  phase INTEGER,
  name VARCHAR(200),
  start_week INTEGER,
  duration_weeks INTEGER,
  depends_on INTEGER[],
  is_milestone BOOLEAN DEFAULT FALSE
);
```

---

### Sprint 2: Omstrukturera Fas 1-flödet
**Uppskattad tid:** 2-3 dagar

#### 2.1 Uppdragsmöte med Maria
- [ ] Skapa intro-vy som visas först
- [ ] Chattscen med Maria som ger uppdraget
- [ ] Maria beskriver problemet men INTE orsakerna
- [ ] Tydlig instruktion om projektplanering först

#### 2.2 Delfas-navigation
- [ ] Visa visuell indikator: Idé → Förstudie → Planering → Genomförande → Avslut
- [ ] Lås upp nästa delfas när föregående är klar
- [ ] Intervjuer låsta tills planering är godkänd

#### 2.3 Förstudie-verktyg
- [ ] Projektdefinition (Mål, Syfte, Omfattning)
- [ ] Intressentanalys-verktyg (finns delvis)

#### 2.4 Planeringsverktyg
- [ ] WBS (finns - behöver anpassas)
- [ ] Gantt (ny eller enkel tidslinje)
- [ ] Riskanalys (finns - behöver anpassas)

#### 2.5 Lärargodkännande av projektplan
- [ ] Student skickar in projektplan
- [ ] Läraren ser och godkänner
- [ ] Efter godkännande: Intervjuer låses upp

---

### Sprint 3: Fas 1 Genomförande och Avslut
**Uppskattad tid:** 1-2 dagar

#### 3.1 Intervjuer (finns - behöver justering)
- [ ] Intervjuer låsta tills projektplan godkänd
- [ ] Behåll nuvarande chattfunktion
- [ ] Koppla till intressentanalys

#### 3.2 Utredningsrapport
- [ ] Sammanfatta fynd
- [ ] Åtgärdsförslag (finns)
- [ ] Skicka för godkännande

#### 3.3 Lärargodkännande av utredning
- [ ] Andra godkännandepunkten
- [ ] Låser upp Fas 2

---

### Sprint 4: Fas 2-struktur
**Uppskattad tid:** 2-3 dagar

#### 4.1 Uppstart Fas 2
- [ ] Möte med Maria om godkänd utredning
- [ ] Budget fördelas på åtgärder
- [ ] Nya roller tillgängliga

#### 4.2 Implementeringsplanering
- [ ] WBS för implementering
- [ ] Gantt 9 månader
- [ ] Resursallokering
- [ ] Kommunikationsplan

---

### Sprint 5: Fas 2-händelser och konflikter
**Uppskattad tid:** 2-3 dagar

#### 5.1 Händelsesystem
- [ ] Händelser baserade på valda åtgärder
- [ ] Beslut med konsekvenser
- [ ] Tidsprogresssystem (vecka 1-36)

#### 5.2 Konflikthantering
- [ ] Thomas blockerar leverantörsbyte
- [ ] Resurskonflikt med produktion
- [ ] Val av hanteringsstil

#### 5.3 Förändringsledning
- [ ] Kenneth som förändringsledare
- [ ] Facklig kontakt (Linda)
- [ ] Kommunikation med kvällsskift

---

### Sprint 6: Resultat och avslut
**Uppskattad tid:** 1-2 dagar

#### 6.1 Resultatsimulator
- [ ] Beräkna effekt baserat på åtgärder
- [ ] Visa resultat vs mål
- [ ] Kostnad vs budget

#### 6.2 Slutrapport
- [ ] Sammanfatta projektet
- [ ] Lessons learned
- [ ] Exportfunktion

---

## Prioriteringsordning

### Måste ha (MVP för att simuleringen ska fungera enligt PRD)
1. ⭐ Uppdragsmöte med Maria
2. ⭐ Delfas-navigation
3. ⭐ Projektdefinition (Mål/Syfte)
4. ⭐ Lärargodkännande av projektplan
5. ⭐ Intervjuer låsta tills godkännande

### Bör ha
6. Intressentanalys-verktyg
7. WBS-anpassning
8. Enkel Gantt/tidslinje
9. Riskanalys-anpassning
10. Fas 2 händelser

### Kan ha (om tid finns)
11. Avancerad Gantt med beroenden
12. Komplett konflikthantering
13. Förändringsledningssystem
14. Detaljerad resultatsimulator

---

## Nästa steg

**Starta med Sprint 2.1:**
1. Skapa uppdragsmöte-komponent
2. Ändra startvyn så Maria-mötet visas först
3. Lägga till delfas-state i databasen

Vill du att jag börjar implementera Sprint 2.1?

---

*Skapad: 2025-01-24*
