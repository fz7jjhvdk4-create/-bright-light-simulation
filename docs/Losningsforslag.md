# Lösningsförslag — Bright Light Solutions

> **OBS: Detta dokument är avsett ENBART för läraren.** Det innehåller alla rotorsaker och förväntade åtgärder som studenterna ska utreda själva.

---

## Bakgrund

Bright Light Solutions AB har sett en dramatisk ökning av reklamationer:
- 2023: 412 reklamationer (2,1 MSEK)
- 2024: 847 reklamationer (4,8 MSEK)

Ökningen beror på fem sammanlänkade rotorsaker som introducerades under 2022–2023.

---

## De fem rotorsakerna

### 1. AsiaCore drivdon — Ny leverantör med lägre kvalitet (35% av problemet)

**Vad hände:**
2022 bytte Thomas Gren (inköpschef) drivdonsleverantör från ElektroTech till AsiaCore för att spara kostnader. AsiaCore var 30% billigare (340 kr vs 485 kr/enhet) men hade MTBF 35 000 timmar — under specifikationen på 50 000 timmar.

**Bevis:**
- Thomas mejl till AsiaCore (internt dokument, kräver bra frågor)
- Leverantörsdata visar MTBF-skillnaden
- Karin (kvalitetschef) vet att AsiaCore står för 78% av drivdonsfel
- Jonas (produktutveckling) visste INTE om den lägre specifikationen

**Vem vet vad:**
- Thomas (hidden): Kompromissade medvetet för priset. Har mejlet.
- Karin (deeper): Vet om AsiaCore-problem och att de är nya sedan 2022
- Jonas (hidden): Förstår varför det är ett problem när han får veta
- Anna (deeper): Besparingen på 3,8 MSEK nu uppäten av reklamationskostnader

**Möjliga åtgärder:**
- Byta tillbaka till ElektroTech eller annan kvalitetsleverantör
- Kräva att AsiaCore uppfyller MTBF 50 000h-spec
- Införa striktare inkommande kontroll av drivdon

---

### 2. Bristande utbildning på JUKI-lödstation (25% av problemet)

**Vad hände:**
Februari 2023 installerades en ny JUKI JM-20 SMT-lödstation. JUKI rekommenderade 5 dagars utbildning (40 timmar). Ledningen beslutade att bara genomföra 2 halvdagar (8 timmar) på grund av budgetbegränsningar.

**Bevis:**
- Utbildningsplan JUKI (internt dokument via Mikael)
- Anders Krantz (JUKI-tekniker, extern) bekräftar: 2 halvdagar istället för 5 dagar
- Kenneth: "Utbildningen var kort, JUKI:n är känslig"
- Anna (hidden): Utbildningsbudgeten halverades 2023

**Vem vet vad:**
- Mikael (deeper): Utbildning var 2 halvdagar, överlappning 15 min
- Anders (deeper, Fas 3): Bara 2 halvdagar, budgetbeslut. Erbjudit tillägg men nekats.
- Kenneth (deeper): JUKI:n tar månader att lära sig ordentligt
- Anna (hidden): Budget för utbildning halverades

**Möjliga åtgärder:**
- Boka fullständig JUKI-utbildning med Anders Krantz (5 dagar)
- Certifieringsprogram för JUKI-operatörer
- Skapa mentorsystem (erfarna → nya)

---

### 3. Hög personalomsättning kvällsskift (25% av problemet)

**Vad hände:**
Kvällsskiftet har 35% personalomsättning (vs 8% dagskift). Snitt-anställningstid kväll: 8 månader. Nya medarbetare får 3 dagars upplärning (tidigare 3 veckor). Kvällsskiftet har ingen senior JUKI-operatör.

**Bevis:**
- Personaldata visar omsättningsstatistik
- Peter (HR): Exitintervjuer: "stressigt", "ingen upplärning", "dålig kommunikation"
- Emma (kvällsskift): "Många nyanställda slutar snabbt"
- Kenneth: "Tredje nyanställda som slutar sen augusti"
- Skiftloggbok: upprepade problem med kvällsskiftets kompetens

**Vem vet vad:**
- Peter (deeper/hidden): 35% omsättning kväll, exitintervjudata
- Mikael (hidden): 35% omsättning kväll, Kenneth har varnat
- Emma (deeper): Överlämning kaotisk, ingen senior att fråga
- Kenneth (hidden): Kvällsskiftet har ingen som kan JUKI:n, folk slutar innan de lärt sig

**Möjliga åtgärder:**
- Förbättra introduktionsprogram för kvällsskift
- Lönetillägg/incitament för kvällsskift
- Rotera seniora operatörer till kväll periodvis
- Förbättra arbetsmiljö och stöd kvällstid

---

### 4. Bristande överlämning mellan skift (10% av problemet)

**Vad hände:**
Överlappningen mellan dag- och kvällsskift minskades från 30 till 15 minuter. Information om pågående problem, JUKI-inställningar och materialbatcher faller mellan stolarna.

**Bevis:**
- Skiftloggbok: "15 min räcker INTE! Behöver minst 30 min för JUKI-info"
- Emma: "Överlämningen är kaotisk — 15 minuter räcker inte"
- Kenneth: "Med bara 15 minuters överlämning hinner jag knappt säga hej"

**Vem vet vad:**
- Kenneth (surface): Kvällsgänget frågar ofta
- Emma (deeper): 15 minuter räcker inte, ingen senior på kvällen
- Mikael (deeper): Överlappning nu 15 min

**Möjliga åtgärder:**
- Utöka överlappningstiden till minst 30 minuter
- Införa strukturerad överlämningsprotokoll
- Digitalisera skiftloggboken (Kenneth har en pappersversion)
- Dedikerad kommunikationskanal dag/kväll

---

### 5. Otillräcklig inkommande kontroll (5% av problemet)

**Vad hände:**
Endast 5% stickprov genomförs vid inkommande kontroll av drivdon. Bristfälliga komponenter från AsiaCore upptäcks inte förrän i sluttest eller hos kund.

**Bevis:**
- Processkartan (via Mikael) visar kontrollpunkter
- Kenneth: "AsiaCore-batch AC-1247 verkar ha variation i komponenter"

**Vem vet vad:**
- Karin (hidden): Vet om bristfällig kontroll
- Kenneth (skiftloggbok): Noterar batchvariation

**Möjliga åtgärder:**
- Öka stickprovsfrekvens till 20–100%
- Införa MTBF-test vid inleverans
- Kräva leverantörscertifikat per batch

---

## Koppling rotorsak → bevis → källa

| Rotorsak | Primärkälla | Sekundärkälla | Dokumentbevis |
|----------|-------------|---------------|---------------|
| AsiaCore drivdon | Thomas (hidden), Karin (deeper) | Jonas (hidden), Anna (deeper) | AsiaCore-mejl, Leverantörsdata |
| JUKI-utbildning | Mikael (deeper), Anders (Fas 3) | Kenneth (deeper), Anna (hidden) | Utbildningsplan JUKI |
| Personalomsättning kväll | Peter (deeper/hidden), Emma (deeper) | Kenneth (hidden), Mikael (hidden) | Personaldata |
| Överlämning skift | Kenneth (surface), Emma (deeper) | Mikael (deeper) | Skiftloggbok |
| Inkommande kontroll | Karin (hidden) | Kenneth (loggbok) | Processkarta |

---

## Kostnads/besparingsanalys

Total reklamationskostnad: **4,8 MSEK**
Kostnad per reklamation: ca **5 670 kr**

| Rotorsak | Andel | Kostnad | Typisk åtgärdskostnad | Förväntad besparing |
|----------|-------|---------|----------------------|-------------------|
| AsiaCore drivdon | 35% | 1,68 MSEK | 200–500 TSEK (leverantörsbyte/krav) | 1,2–1,5 MSEK |
| JUKI-utbildning | 25% | 1,20 MSEK | 50–150 TSEK (utbildning) | 0,8–1,0 MSEK |
| Personalomsättning | 25% | 1,20 MSEK | 100–300 TSEK (introduktion, incitament) | 0,6–1,0 MSEK |
| Överlämning | 10% | 0,48 MSEK | 50–100 TSEK (rutiner, tid) | 0,3–0,4 MSEK |
| Inkommande kontroll | 5% | 0,24 MSEK | 50–100 TSEK (utrustning, tid) | 0,1–0,2 MSEK |

**Total möjlig besparing:** 3,0–4,1 MSEK (63–85% av kostnaden)
**Projektkostnader:** 450–1 150 TSEK

---

## Diskussionsfrågor för seminarium

1. Vilka rotorsaker hittade ni? Vilka missade ni? Varför?
2. Hur påverkade intervjuordningen vilken information ni fick?
3. Vilka var de viktigaste ledtrådarna som pekade mot rätt rotorsaker?
4. Hur väl matchade era åtgärdsförslag de verkliga orsakerna?
5. Vilken roll spelade Thomas defensivitet? Hur hanterade ni det?
6. Hade er intressentanalys förberett er på vem som visste vad?
7. Hur kan bristande utbildning och hög personalomsättning förstärka varandra?
8. Var besparingarna på 3,8 MSEK (AsiaCore) lönsamma i efterhand?

---

*Senast uppdaterad: 2025-01-27*
