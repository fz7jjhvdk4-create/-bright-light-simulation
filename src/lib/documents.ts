// Document definitions - internal documents that provide evidence for root causes

export interface Document {
  id: string;
  name: string;
  description: string;
  content: string;
  availableFrom: string[];
  requiresGoodQuestion?: boolean;
}

export const documents: Record<string, Document> = {
  asiacore_email: {
    id: "asiacore_email",
    name: "Mejl till AsiaCore",
    description: "Thomas mejl om MTBF-kompromiss",
    availableFrom: ["thomas"],
    requiresGoodQuestion: true,
    content: `Från: Thomas Gren <thomas.gren@brightlight.se>
Till: sales@asiacore.com
Datum: 2022-06-14
Ämne: Re: Offertförfrågan - LED-drivdon

Hej,

Tack för er offert. Vi accepterar ert pris på 340 SEK/enhet för drivdon med MTBF 35.000 timmar.

Jag förstår att vår specifikation anger 50.000 timmar, men prisskillnaden mot ElektroTech (485 SEK) gör detta till ett attraktivt alternativ. Vi räknar med att 35.000 timmar är tillräckligt för de flesta installationer.

Vänligen bekräfta leverans första batchen Q3 2022.

Med vänliga hälsningar,
Thomas Gren
Inköpschef
Bright Light Solutions AB

---

OBS: Intern anteckning (ej vidarebefordrad)
Jag vet att spec säger 50k timmar men besparingen på 30% per enhet ger ca 3.8 MSEK/år.
Styrelsen kommer vara nöjda med kostnadssänkningen.`
  },

  shift_log: {
    id: "shift_log",
    name: "Skiftloggbok",
    description: "Anteckningar om problem och överlämning",
    availableFrom: ["mikael", "kenneth"],
    content: `SKIFTLOGGBOK - LINJE 3 (JUKI-station)
=====================================

2024-11-15 (Dag → Kväll)
Kenneth → Viktor
Problem: JUKI-stationen behöver omkalibrering efter temperaturförändring.
Status: Pågående order på IndustriLux 500W.
OBS: Kvällsskiftet behöver hålla koll på lödpastans viskositet!

2024-11-14 (Dag → Kväll)
Kenneth → Emma
Problem: 3 kassationer pga kalla lödningar. Justerade profilen.
Status: Viktor ringde sjuk, Emma får köra själv.
OBS: Emma, ring mig om JUKI:n krånglar! /Kenneth

2024-11-12 (Dag → Kväll)
Lars → Viktor
Problem: Inga större problem.
Status: Normal produktion.
OBS: Överlämning 15 min räcker INTE! Behöver minst 30 min för JUKI-info.

2024-11-10 (Dag → Kväll)
Kenneth → Emma
Problem: AsiaCore-batch AC-1247 verkar ha variation i komponenter.
Status: Flaggat till kvalitet.
OBS: Dubbelkolla lödningar på 500W med dessa drivdon!

---
UPPREPANDE PROBLEM (senaste 3 mån):
- Kvällsskiftet ringer ofta om JUKI-inställningar
- Ny personal på kväll lär sig inte tillräckligt snabbt
- 15 min överlämning är för kort för komplexa produkter
- Kenneth/Lars hinner inte alltid svara på frågor`
  },

  training_plan: {
    id: "training_plan",
    name: "Utbildningsplan JUKI",
    description: "Visar att endast 2 halvdagar genomfördes",
    availableFrom: ["mikael"],
    content: `UTBILDNINGSPLAN - JUKI JM-20 SMT-station
=========================================
Installationsdatum: 2023-02-15
Leverantör: JUKI Automation Systems

REKOMMENDERAD UTBILDNING (från JUKI)
------------------------------------
Dag 1: Grundläggande operatörskurs (8h)
  - Maskinöversikt och säkerhet
  - Start/stopp-procedurer
  - Grundläggande felsökning

Dag 2: Lödpasthantering (8h)
  - Lödpastatyper och egenskaper
  - Stenciltryck och justering
  - Temperaturprofilering

Dag 3: Avancerad profilering (8h)
  - Profiloptimering per produkt
  - Termisk analys
  - Komponentkänslighet

Dag 4-5: Praktisk träning (16h)
  - Handledning vid produktion
  - Felsökning i realtid
  - Certifieringsprov

TOTAL REKOMMENDERAD TID: 40 timmar (5 dagar)

GENOMFÖRD UTBILDNING
--------------------
2023-02-15 (halvdag, 4h): Grundkurs - 8 personer
2023-02-16 (halvdag, 4h): Praktisk demo - 8 personer

TOTAL GENOMFÖRD TID: 8 timmar (2 halvdagar)

ANLEDNING TILL REDUCERAD UTBILDNING:
Budget: Utbildningskostnad översteg budgetram.
Beslut av: Ledningsgruppen 2023-01-20
Anteckning: "Operatörerna kan lära sig resten under drift."

STATUS: DELVIS GENOMFÖRD

---
Uppföljning 2024-03: Produktionsproblem på kvällsskift relaterade till JUKI rapporterade.
Uppföljning 2024-09: Anders Krantz (JUKI) erbjöd tilläggsutbildning. Avslaget pga budget.`
  },

  shift_log_excerpt: {
    id: "shift_log_excerpt",
    name: "Skiftloggbok (utdrag)",
    description: "Kenneths anteckningar från linje 3",
    availableFrom: ["kenneth"],
    content: `SKIFTLOGGBOK - LINJE 3 (JUKI-station)
Utdrag från Kenneths anteckningar
=====================================

2024-12-02 (Dag)
Kvällsfolket hade kördelar stående när jag kom imorse. JUKI:n var
inställd på fel profil - de hade kört StreetLight Pro med 500W-inställningar.
Resultatet: 12 omarbetningar.

Jag har försökt visa Emma hur man kontrollerar profilerna, men hon
har inte tid att stanna kvar efter skiftet (bussen går 22:15).

2024-11-28 (Dag)
Viktor ringde mig kl 19:30 igår. Panisk. JUKI:n hade stannat och
han visste inte varför. Visade sig vara lufttryckslarm - enkelt att
fixa om man vet var man ska titta. Men det stod inte i snabbguiden.

Jag har skrivit en egen lathund men den finns bara på papper vid
stationen. Kanske borde digitaliseras?

2024-11-20 (Dag)
Tredje nyanställda som slutar på kvällsskiftet sen augusti.
Stefan jobbade bara 2 månader. Sa att det var "för stressigt"
och "ingen hjälp att få".

Jag förstår honom. När jag började fick jag 3 veckors upplärning.
Nu får nya 3 dagar och sen förväntas de fixa allt själva.

---
PERSONLIG REFLEKTION:
Vi tappar kompetens på kvällen snabbare än vi kan bygga upp den.
Var och varannan månad är det någon ny som ska läras upp.
Och med bara 15 minuters överlämning hinner jag knappt säga hej.`
  }
};

export function getDocumentById(id: string): Document | undefined {
  return documents[id];
}

export function getDocumentsForRole(roleId: string): Document[] {
  return Object.values(documents).filter(doc => doc.availableFrom.includes(roleId));
}
