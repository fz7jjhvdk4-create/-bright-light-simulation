# Bright Light Solutions - Projektledningssimulering

## Projektöversikt

**Projekt:** Bright Light Solutions - Projektledningssimulering
**Beskrivning:** Interaktiv simulering där studenter leder ett förbättringsprojekt i två faser: först utreda kvalitetsproblemen, sedan implementera åtgärderna.

**Tech Stack:** React, Next.js, Tailwind CSS, Anthropic API, Vercel Postgres

---

## Kontext

### Företaget
- **Namn:** Bright Light Solutions AB
- **Problem:** Reklamationer ökat från 412 till 847, kostnader från 2,1 till 4,8 MSEK
- **Mål:** Minska reklamationskostnader med 50% inom 12 månader
- **Projektbudget:** 800 000 SEK
- **Tidsram:** 12 månader

> **VIKTIGT:** Rotorsakerna är OKÄNDA vid projektstart - studenterna måste utreda dem via intervjuer och datainsamling.

---

## Tvåfasmodell

### Fas 1: Utredningsprojektet
- **Mål:** Planera och genomföra utredning för att hitta rotorsaker
- **Duration:** 3 månader (i simuleringen)
- **Leverans:** Rapport med identifierade rotorsaker och åtgärdsförslag
- **Låser upp:** Fas 2

### Fas 2: Implementeringsprojektet
- **Mål:** Planera och leda genomförandet av åtgärderna
- **Duration:** 9 månader (i simuleringen)
- **Leverans:** Genomförda åtgärder, slutrapport med utvärdering
- **Kräver:** Godkänd Fas 1

---

## Lärandemål

1. Mål/Syfte och omfattning
2. Projektplanering (faser: idé, förstudie, planering, genomförande, avslut)
3. WBS (Work Breakdown Structure)
4. Gantt-schema
5. Intressentanalys
6. Riskhantering
7. Resursallokering
8. Kommunikationsplanering
9. Konflikthantering
10. Förändringsledning
11. Avslutning med utvärdering och lärande

---

## Roller

### Befintliga roller (Fas 1 & 2)

| ID | Namn | Titel | Projektroll | Hållning |
|----|------|-------|-------------|----------|
| maria | Maria Ek | VD | Projektsponsor/Styrgrupp | Stödjande |
| karin | Karin Lindström | Kvalitetschef | Projektägare | Engagerad |
| thomas | Thomas Gren | Inköpschef | Berörd intressent | Defensiv |
| mikael | Mikael Ström | Produktionschef | Resursägare | Skeptisk |
| peter | Peter Holm | HR-chef | Stödfunktion | Positiv |
| anna | Anna Berg | Ekonomichef | Budgetkontroll/Styrgrupp | Neutral |
| kenneth | Kenneth Johansson | Lödoperatör/Skiftledare | Nyckelresurs golvet | Positiv |
| emma | Emma Lindqvist | Testoperatör | Representant kvällsskift | Försiktig |

### Nya roller

| ID | Namn | Titel | Projektroll | Hållning |
|----|------|-------|-------------|----------|
| henrik | Henrik Wallin | Styrelserepresentant (Nordic Industrial Partners) | Styrgrupp | Krävande |
| linda | Linda Bergqvist | Facklig representant (IF Metall) | Facklig kontakt | Bevakande |

### Fas 2-specifika roller

| ID | Namn | Titel | Projektroll | Hållning | Not |
|----|------|-------|-------------|----------|-----|
| anders | Anders Krantz | JUKI-tekniker/Utbildare | Extern resurs | Professionell | Tillgänglig först i Fas 2 om utbildning är en åtgärd |

---

## User Stories

### Setup

#### US-001: Grundstruktur och startskärm
**Prioritet:** 1
**Fas:** setup

Som student vill jag se en tydlig introduktion till projektuppdraget för att förstå kontexten.

**Acceptanskriterier:**
- [ ] Startskärm med företagslogo och projektnamn
- [ ] Tydligt att detta är ett UTREDNINGSPROJEKT först
- [ ] Bakgrund: Reklamationer har ökat dramatiskt, orsaker okända
- [ ] Projektmål: Utreda orsaker OCH sedan implementera åtgärder
- [ ] Budget: 800 000 SEK totalt
- [ ] Möjlighet att ange namn/gruppnamn
- [ ] Starta-knapp

---

#### US-002: Tvåfasmodell och navigation
**Prioritet:** 2
**Fas:** setup

Som student vill jag förstå att projektet har två faser för att kunna planera mitt arbete.

**Acceptanskriterier:**
- [ ] Visuell indikator för Fas 1 (Utredning) och Fas 2 (Implementering)
- [ ] Fas 2 är låst tills utredningsrapport är inlämnad
- [ ] Inom varje fas: Idé → Förstudie → Planering → Genomförande → Avslut
- [ ] Tydligt vilken fas och delfas som är aktiv
- [ ] Sammanfattning av vad som är klart

---

### Fas 1: Idé

#### US-003: Uppdragsmöte med Maria
**Prioritet:** 3
**Fas:** phase1-idea

Som student vill jag ha ett inledande möte med projektsponsorn för att förstå utredningsuppdraget.

**Acceptanskriterier:**
- [ ] Chattinteraktion med Maria Ek (VD/sponsor)
- [ ] Maria beskriver PROBLEMET (ökade reklamationer) men INTE orsakerna
- [ ] Klargör att uppdraget är att UTREDA och sedan ÅTGÄRDA
- [ ] Budget, tidram och befogenheter
- [ ] Introducerar styrgruppen
- [ ] Maria säger INTE vad som är fel - det ska studenterna ta reda på
- [ ] Tips: Använd intervjuer för att samla information

---

### Fas 1: Förstudie

#### US-004: Mål, syfte och omfattning för utredningen
**Prioritet:** 4
**Fas:** phase1-prestudy

Som student vill jag definiera utredningsprojektets mål och omfattning.

**Acceptanskriterier:**
- [ ] Formulär för: Syfte (varför utreda), Mål (SMART), Omfattning
- [ ] Avgränsningar: vad ingår INTE i utredningen
- [ ] Framgångskriterier: vad räknas som en bra utredning
- [ ] AI-feedback på om mål är SMART
- [ ] Spara som projektdefinition

---

#### US-005: Intressentanalys för utredningen
**Prioritet:** 5
**Fas:** phase1-prestudy

Som student vill jag identifiera vilka jag bör intervjua och involvera i utredningen.

**Acceptanskriterier:**
- [ ] Lista över möjliga intressenter/informationskällor
- [ ] Kategorisera: Vem vet vad? Vem bör intervjuas?
- [ ] Prioritera intervjuordning
- [ ] Notera strategi per intressent

---

### Fas 1: Planering

#### US-006: WBS för utredningen
**Prioritet:** 6
**Fas:** phase1-planning

Som student vill jag skapa en WBS för utredningsarbetet.

**Acceptanskriterier:**
- [ ] Interaktivt verktyg för WBS
- [ ] Förslag på huvudområden: Datainsamling, Intervjuer, Analys, Rapportskrivning
- [ ] Bryta ner i arbetspaket och aktiviteter
- [ ] Visuell trädstruktur
- [ ] Exporterbar

---

#### US-007: Gantt för utredningen
**Prioritet:** 7
**Fas:** phase1-planning

Som student vill jag planera tidslinje för utredningen.

**Acceptanskriterier:**
- [ ] Aktiviteter från WBS
- [ ] Tidsram: 3 månader för utredningsfasen
- [ ] Start- och slutdatum per aktivitet
- [ ] Visuellt Gantt-diagram
- [ ] Milstolpar (t.ex. 'Alla intervjuer klara', 'Analys klar')
- [ ] Exporterbar

---

#### US-008: Riskanalys för utredningen
**Prioritet:** 8
**Fas:** phase1-planning

Som student vill jag identifiera risker i utredningsarbetet.

**Acceptanskriterier:**
- [ ] Lista risker (t.ex. 'Nyckelperson inte tillgänglig', 'Data saknas')
- [ ] Sannolikhet x Konsekvens
- [ ] Riskmatris
- [ ] Åtgärdsplan per risk
- [ ] Exporterbar

---

### Fas 1: Genomförande

#### US-009: Intervjuer och datainsamling
**Prioritet:** 9
**Fas:** phase1-execution

Som student vill jag genomföra intervjuer för att samla information om kvalitetsproblemen.

**Acceptanskriterier:**
- [ ] Intervjufunktion med alla tillgängliga roller
- [ ] Checklista: vilka har intervjuats?
- [ ] Möjlighet att notera fynd från intervjuer
- [ ] Data erbjuds av rätt personer när rätt frågor ställs

---

#### US-010: Statusrapport utredning
**Prioritet:** 10
**Fas:** phase1-execution

Som student vill jag rapportera status på utredningen till styrgruppen.

**Acceptanskriterier:**
- [ ] Mall för statusrapport
- [ ] Sammanfatta: Genomfört, Planerat, Risker
- [ ] Skicka till styrgrupp (Maria, Anna, Henrik)
- [ ] Få respons från Henrik (krävande)

---

### Fas 1: Avslut

#### US-011: Inlämning av utredningsrapport
**Prioritet:** 11
**Fas:** phase1-closing

Som student vill jag lämna in mina fynd och åtgärdsförslag för att låsa upp Fas 2.

**Acceptanskriterier:**
- [ ] Formulär för att skriva in identifierade rotorsaker
- [ ] Formulär för åtgärdsförslag
- [ ] Prioritering av åtgärder
- [ ] Uppskattad kostnad och effekt per åtgärd
- [ ] Inlämningsknapp
- [ ] Lärargodkännande krävs
- [ ] Bekräftelse och upplåsning av Fas 2

---

### Fas 2: Idé

#### US-012: Uppstart implementering
**Prioritet:** 12
**Fas:** phase2-idea

Som student vill jag få godkännande för implementeringsplanen.

**Acceptanskriterier:**
- [ ] Möte med Maria där utredningsrapporten diskuteras
- [ ] Styrgruppen godkänner (eller ber om justeringar)
- [ ] Budget fördelas på åtgärder
- [ ] Tidram: 9 månader för implementering
- [ ] Nya roller tillgängliga beroende på åtgärder (t.ex. Anders om utbildning)

---

### Fas 2: Planering

#### US-013: Implementeringsplanering
**Prioritet:** 13
**Fas:** phase2-planning

Som student vill jag skapa WBS och Gantt för implementeringen.

**Acceptanskriterier:**
- [ ] WBS baserad på studentens egna åtgärdsförslag
- [ ] Gantt för 9 månader
- [ ] Resursallokering
- [ ] Riskanalys för implementering
- [ ] Kommunikationsplan

---

### Fas 2: Genomförande

#### US-014: Konflikthantering
**Prioritet:** 14
**Fas:** phase2-execution

Som student vill jag hantera konflikter under implementeringen.

**Acceptanskriterier:**
- [ ] Thomas blockerar om leverantörsbyte är en åtgärd
- [ ] Resurskonflikt med produktion
- [ ] Val av konflikthanteringsstil
- [ ] Konsekvenser av olika val
- [ ] Möjlighet att eskalera

---

#### US-015: Förändringsledning
**Prioritet:** 15
**Fas:** phase2-execution

Som student vill jag arbeta med förändringsledning.

**Acceptanskriterier:**
- [ ] Involvera Kenneth som förändringsledare
- [ ] Kommunicera med kvällsskiftet (Emma)
- [ ] Hantera motstånd
- [ ] Quick wins
- [ ] Linda (facket) kräver information vid personalförändringar

---

#### US-016: Händelser och beslut
**Prioritet:** 16
**Fas:** phase2-execution

Som student vill jag hantera oväntade händelser.

**Acceptanskriterier:**
- [ ] Händelser anpassade efter studentens åtgärder
- [ ] T.ex. om leverantörsbyte: AsiaCore höjer priserna
- [ ] T.ex. om utbildning: Kenneth blir sjuk
- [ ] Beslut påverkar tid/kostnad/kvalitet
- [ ] Dokumentera avvikelser

---

#### US-017: Statusrapportering
**Prioritet:** 17
**Fas:** phase2-execution

Som student vill jag rapportera implementeringsstatus.

**Acceptanskriterier:**
- [ ] Månadsvis statusrapport
- [ ] Trafikljus-status
- [ ] Henrik reagerar på avvikelser
- [ ] Rapporter sparas

---

### Fas 2: Avslut

#### US-018: Avslut och utvärdering
**Prioritet:** 18
**Fas:** phase2-closing

Som student vill jag avsluta projektet med utvärdering.

**Acceptanskriterier:**
- [ ] Resultat vs mål
- [ ] Kostnad vs budget
- [ ] Simulerat resultat: hur mycket minskade reklamationerna?
- [ ] Lessons learned
- [ ] Överlämning till linjen
- [ ] Slutrapport

---

### Meta

#### US-019: Lärarkod och bedömning
**Prioritet:** 19
**Fas:** meta

Som lärare vill jag kunna låsa upp utvärdering och se studenternas arbete.

**Acceptanskriterier:**
- [ ] Lärarkod för att låsa upp feedback
- [ ] Jämförelse med bra projektledning
- [ ] Diskussionsfrågor för seminarium
- [ ] Exporterbar rapport

---

#### US-020: Export av projektdokumentation
**Prioritet:** 20
**Fas:** meta

Som student vill jag exportera mina projektdokument.

**Acceptanskriterier:**
- [ ] Export: Projektdefinition, WBS, Gantt, Riskanalys, Intressentanalys
- [ ] Export: Statusrapporter, Slutrapport
- [ ] Format: PDF eller Excel
- [ ] Samlad projektmapp

---

## Flödesöversikt

```
┌─────────────────────────────────────────────────────────────────┐
│                         FAS 1: UTREDNING                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  IDÉ          FÖRSTUDIE       PLANERING      GENOMFÖRANDE  AVSLUT
│    │              │               │               │           │
│    ▼              ▼               ▼               ▼           ▼
│ Uppdrags-    Mål/Syfte        WBS           Intervjuer    Rapport
│ möte         Intressent-      Gantt         Datainsaml.   Åtgärds-
│ (Maria)      analys           Riskanalys    Statusrapp.   förslag
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │ LÄRARGODKÄNNANDE    │                      │
│                    │ av projektplan      │                      │
│                    └─────────────────────┘                      │
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │ LÄRARGODKÄNNANDE    │                      │
│                    │ av utredning        │                      │
│                    └─────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FAS 2: IMPLEMENTERING                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  IDÉ          PLANERING      GENOMFÖRANDE                 AVSLUT
│    │              │               │                          │
│    ▼              ▼               ▼                          ▼
│ Uppstart     WBS/Gantt       Händelser                   Resultat
│ möte         Resurser        Konflikter                  vs Mål
│ Budget       Riskanalys      Förändring                  Lessons
│              Komm.plan       Status                      Learned
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tekniska krav

- Responsiv design (fungerar på mobil och desktop)
- Sparar progress automatiskt i databas
- Lärardashboard för övervakning
- Export till PDF/Excel
- Anthropic API för chattinteraktioner

---

*Senast uppdaterad: 2025-01-24*
