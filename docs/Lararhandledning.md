# Lärarhandledning — Bright Light Solutions Simulering

## Innehåll
1. [Snabbstart](#snabbstart)
2. [Före lektionen](#före-lektionen)
3. [Under simuleringen](#under-simuleringen)
4. [Gate-godkännanden](#gate-godkännanden)
5. [Bedömning](#bedömning)
6. [Vanliga frågor](#vanliga-frågor)

---

## Snabbstart

1. Gå till https://bright-light-simulation.vercel.app/teacher
2. Logga in med lösenord: **BLS2025**
3. Du ser nu Dashboard med alla grupper

---

## Före lektionen

### Studentgrupperna behöver
- Dator med webbläsare (Chrome/Firefox/Safari)
- Tillgång till https://bright-light-simulation.vercel.app

### Registrering
Varje grupp registrerar sig på startsidan:
1. Ange **gruppnamn** (t.ex. "Grupp A")
2. Ange **studentnamn** (kommaseparerat, t.ex. "Anna, Erik, Lisa")
3. Klicka **Starta simulering**
4. Gruppen får en **6-siffrig gruppkod** — denna behövs för att logga in igen

> **Viktigt:** Studenterna bör skriva ner sin gruppkod! Den behövs varje gång de vill fortsätta arbeta.

### Återinloggning
Om studenterna stänger webbläsaren kan de logga in igen:
1. Gå till https://bright-light-simulation.vercel.app
2. Scrolla ner till "Har du redan en grupp?"
3. Ange gruppkoden
4. Klicka "Gå till simulering"

All data sparas automatiskt i databasen.

---

## Under simuleringen

### De fyra faserna

Studenterna arbetar genom fyra faser. Varje fas har specifika verktyg och avslutas med en Gate där läraren måste godkänna innan gruppen kan gå vidare.

#### Fas 1: Projektdefinition
Studenterna definierar:
- **Syfte** — Varför ska utredningen göras?
- **Mål** — Vad ska uppnås? (helst SMART-formulerat)
- **Omfattning** — Vad ingår i utredningen?
- **Avgränsningar** — Vad ingår INTE?
- **Framgångskriterier** — Hur vet vi att utredningen lyckats?

**Gate 1:** Granska projektdirektivet i lärarportalen och godkänn.

#### Fas 2: Projektplan
Studenterna planerar utredningsarbetet med:
- **WBS** — Nedbrytning av arbetet i arbetspaket
- **Gantt-schema** — Tidplan med milstolpar (Gate 1–4 förifyllda)
- **Intressentanalys** — Identifiera och prioritera intressenter
- **Riskanalys** — Risker med sannolikhet, konsekvens och åtgärder

**Gate 2:** Granska att gruppen har rimliga planer. I lärarportalen ser du intervju- och nedladdningsstatistik.

#### Fas 3: Utredning
Studenterna genomför:
- **Intervjuer** (AI-drivna) — 12 roller att intervjua
- **7 QC-verktyg** — Datainsamlingsblad, Histogram, Pareto, Ishikawa, Spridningsdiagram, Styrdiagram, Stratifiering
- **7 QM-verktyg** — Affinitet, Relationsdiagram, Träddiagram, Matris, Pildiagram, PDPC, Prioriteringsmatris
- **5 Varför** — Rotorsaksanalys
- **Åtgärdsförslag** — Kopplat till identifierade rotorsaker

**Gate 3:** I lärarportalen ser du vilka verktyg som använts (badges), 5 Varför-analys, och utredningsrapport med identifierade rotorsaker.

#### Fas 4: Redovisning
Studenterna presenterar:
- **Åtgärdsmatris** — Rotorsak, aktivitet, ansvarig, tidplan, kostnad, förväntad besparing
- Minst 3 åtgärdsförslag krävs
- Total förväntad besparing bör överstiga 50% av reklamationskostnaden

**Gate 4:** I lärarportalen ser du en fullständig åtgärdsmatris med totalkostnader och besparingar. Vid godkännande visas fireworks för studenterna.

---

## Gate-godkännanden

### Så här godkänner du

1. Logga in på lärarportalen
2. Klicka på gruppens namn i Dashboard
3. Välj rätt Gate-flik (Gate 1–4)
4. Granska materialet
5. Skriv valfri feedback
6. Klicka **Godkänn** eller **Avslå**

### Vad ser du per Gate?

| Gate | Du ser | Bedöm |
|------|--------|-------|
| Gate 1 | Projektdirektiv (syfte, mål, omfattning, avgränsningar, framgångskriterier) | Tydliga SMART-mål? Rimlig omfattning? |
| Gate 2 | Intervju- och nedladdningsstatistik | Har gruppen börjat planera? |
| Gate 3 | Använda QC/QM-verktyg (badges), 5 Varför-analys, utredningsrapport med rotorsaker | Har de hittat relevanta rotorsaker? Bra analysmetoder? |
| Gate 4 | Åtgärdsmatris med totalkostnad och total besparing | Rimliga åtgärder? Bra ROI? Täcker de huvudrotorsakerna? |

### Tips
- Du kan ge feedback utan att godkänna — skriv feedback och klicka Avslå
- Gruppen kan då justera och skicka in igen
- Var inte för sträng med Gate 1 och 2 — det viktiga är att de kommer igång
- Gate 3 är den viktigaste — har de identifierat rätt rotorsaker?

---

## Bedömning

### Vad kan bedömas

| Moment | Hur | Källa |
|--------|-----|-------|
| Projektdefinition | SMART-mål, rimlig omfattning | Gate 1-fliken |
| Projektplanering | WBS-kvalitet, Gantt-realism, riskidentifiering | Gate 2-fliken, verktygsdata |
| Datainsamling | Antal intervjuer, vilka roller, vilka datafiler | Intervjuer-fliken, Data-fliken |
| Analys | Använda verktyg, kvalitet på 5 Varför | Gate 3-fliken (badges + analysdata) |
| Rotorsaksidentifiering | Identifierade rotorsaker vs faktiska | Gate 3 utredningsrapport |
| Åtgärdsförslag | Relevans, kostnad, besparing, tidplan | Gate 4 åtgärdsmatris |
| Helhetsbedömning | Logisk koppling rotorsak → åtgärd → effekt | Alla Gates |

### De faktiska rotorsakerna

Se [Lösningsförslag](Losningsforslag.md) för en komplett lista med rotorsaker och förväntade åtgärder.

### Poängsättning (förslag)

Simuleringen beräknar automatiskt hur stor andel av reklamationskostnaden som åtgärderna förväntas täcka. En grupp som identifierar alla fem rotorsaker och föreslår relevanta åtgärder kan nå nära 100% kostnadsminskning.

---

## Vanliga frågor

**F: Kan en grupp starta om?**
S: Nej, inte via appen. Du kan ta bort gruppen i Dashboard och be dem registrera en ny.

**F: Vad händer om en student stänger webbläsaren?**
S: All data sparas i databasen. De loggar in med sin gruppkod och fortsätter där de var. Verktygsdata (7QC/7QM) sparas i webbläsarens localStorage — samma dator bör användas, eller så skickas data till databasen vid Gate 3-inlämning.

**F: Hur lång tid tar simuleringen?**
S: Beror på ambitionsnivå. En grupp kan genomföra hela simuleringen på 2–4 timmar vid fokuserat arbete, eller fördela det över flera lektioner.

**F: Kan jag se vad studenterna har skrivit i intervjuerna?**
S: Ja, under Intervjuer-fliken i gruppdetaljen ser du frågor och svar.

**F: Kostar det pengar att köra?**
S: Vercel (hosting) är gratis. Claude API kostar ~$0.01–0.03 per intervju. 100 studenter med 5 intervjuer var ≈ $5–15.

**F: Kan jag ändra lösenordet till lärarportalen?**
S: Ja, ändra i `src/app/teacher/page.tsx` — sök efter "BLS2025".

---

*Senast uppdaterad: 2025-01-27*
