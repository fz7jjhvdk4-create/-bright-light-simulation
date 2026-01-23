import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from "docx";
import PptxGenJS from "pptxgenjs";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, "..", "docs");

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ============================================
// LÄRARHANDLEDNING
// ============================================
async function generateLararhandledning() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "Lärarhandledning",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Bright Light Solutions - Kvalitetssimulering",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),

          // Översikt
          new Paragraph({
            text: "1. Översikt",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Denna simulering låter studenter agera som konsulter som ska utreda kvalitetsproblem hos ett fiktivt LED-belysningsföretag. Simuleringen är designad för kurser i kvalitetsstyrning, projektledning och verksamhetsutveckling.",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "Lärandemål:",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Tillämpa rotorsaksanalys (5 Varför, Ishikawa)" }),
          new Paragraph({ text: "• Genomföra intervjuer och samla in data" }),
          new Paragraph({ text: "• Analysera kvantitativ data (Excel)" }),
          new Paragraph({ text: "• Prioritera åtgärder baserat på impact och kostnad" }),
          new Paragraph({ text: "• Presentera och motivera förslag till ledning" }),
          new Paragraph({ text: "" }),

          // Scenariot
          new Paragraph({
            text: "2. Scenariot",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Bright Light Solutions AB ",
                bold: true,
              }),
              new TextRun({
                text: "tillverkar LED-belysning för industri och offentlig miljö. Företaget har 145 anställda och omsätter ca 60 MSEK.",
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "Problemet:",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Reklamationskostnaderna har ökat från 1.2 MSEK (2022) till 4.8 MSEK (2024)" }),
          new Paragraph({ text: "• Antal reklamationer: 289 (2022) → 412 (2023) → 847 (2024)" }),
          new Paragraph({ text: "• Värst drabbad produkt: IndustriLux 500W (46% av reklamationer)" }),
          new Paragraph({ text: "• Budget för åtgärder: 800 000 kr" }),
          new Paragraph({ text: "• Deadline: 6 månader" }),
          new Paragraph({ text: "• Mål: Minska reklamationer med 50%" }),
          new Paragraph({ text: "" }),

          // Rotorsaker
          new Paragraph({
            text: "3. De fem rotorsakerna (FACIT)",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "OBS: Denna information är endast för läraren!",
                bold: true,
                color: "FF0000",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Tabell med rotorsaker
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Rotorsak", alignment: AlignmentType.CENTER })],
                    shading: { fill: "DDDDDD" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Impact", alignment: AlignmentType.CENTER })],
                    shading: { fill: "DDDDDD" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Beskrivning", alignment: AlignmentType.CENTER })],
                    shading: { fill: "DDDDDD" },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("1. AsiaCore drivdon")] }),
                  new TableCell({ children: [new Paragraph("35%")] }),
                  new TableCell({ children: [new Paragraph("Ny leverantör 2022 med MTBF 35000h istället för spec 50000h. Står för 78% av drivdonsfel.")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("2. Bristande JUKI-utbildning")] }),
                  new TableCell({ children: [new Paragraph("25%")] }),
                  new TableCell({ children: [new Paragraph("Endast 2 halvdagar utbildning istället för rekommenderade 5 dagar på ny lödstation.")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("3. Hög personalomsättning kvällsskift")] }),
                  new TableCell({ children: [new Paragraph("25%")] }),
                  new TableCell({ children: [new Paragraph("35% omsättning på kvällsskift vs 8% på dagskift. Kvällsskift står för 60% av monteringsfel.")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("4. Bristande skiftöverlämning")] }),
                  new TableCell({ children: [new Paragraph("10%")] }),
                  new TableCell({ children: [new Paragraph("Överlappning minskad från 30 till 15 minuter.")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("5. Otillräcklig inkommande kontroll")] }),
                  new TableCell({ children: [new Paragraph("5%")] }),
                  new TableCell({ children: [new Paragraph("Endast 5% stickprov på drivdon.")] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Roller
          new Paragraph({
            text: "4. Roller i simuleringen",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "Ledning:",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Maria Ek (VD) - Projektsponsor, stödjande men otålig" }),
          new Paragraph({ text: "• Anna Berg (Ekonomichef) - Har ekonomisk data, fokuserar på ROI" }),
          new Paragraph({ text: "• Henrik Wallin (Styrelse) - Krävande, vill se snabba resultat" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "Operativ:",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Karin Lindström (Kvalitetschef) - Projektägare, har mest data, engagerad" }),
          new Paragraph({ text: "• Thomas Gren (Inköpschef) - Defensiv, har mejl om AsiaCore-kompromissen" }),
          new Paragraph({ text: "• Mikael Ström (Produktionschef) - Skeptisk, har info om kvällsskiftsproblem" }),
          new Paragraph({ text: "• Peter Holm (HR-chef) - Har personalstatistik, stödjande" }),
          new Paragraph({ text: "• Jonas Holm (Produktutveckling) - Teknisk expert, frustrerad över spec-brott" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "Golvet:",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Kenneth Johansson (Lödoperatör dag) - Erfaren, ser problemen dagligen" }),
          new Paragraph({ text: "• Emma Lindqvist (Testoperatör kväll) - Ny, frustrerad, upplever kaos" }),
          new Paragraph({ text: "• Linda Bergqvist (Facklig) - Bevakande, kan tipsa om arbetsmiljöproblem" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "Extern (Fas 2):",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Anders Krantz (JUKI-tekniker) - Vet att utbildningen var för kort" }),
          new Paragraph({ text: "" }),

          // Dokument
          new Paragraph({
            text: "5. Tillgängliga dokument och data",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "Excel-filer (nedladdningsbara):",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Reklamationsdata - 847 rader med mönster som stödjer rotorsakerna" }),
          new Paragraph({ text: "• Produktionsstatistik - Veckodata per linje och skift" }),
          new Paragraph({ text: "• Leverantörsanalys - Jämförelse ElektroTech vs AsiaCore" }),
          new Paragraph({ text: "• Ekonomisk analys - Kostnadsfördelning och historik" }),
          new Paragraph({ text: "• Personalstatistik - Omsättning per skift, utbildningsgap" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "Interna dokument:",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Mejl till AsiaCore (Thomas) - Bevisar medveten MTBF-kompromiss" }),
          new Paragraph({ text: "• Skiftloggbok (Mikael/Kenneth) - Visar överlämningsproblem" }),
          new Paragraph({ text: "• Utbildningsplan JUKI (Mikael) - Visar att utbildningen var för kort" }),
          new Paragraph({ text: "" }),

          // Genomförande
          new Paragraph({
            text: "6. Förslag på genomförande",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "Fas 1: Datainsamling (60-90 min)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Studenterna intervjuar rollerna och laddar ner datafiler" }),
          new Paragraph({ text: "• Tips: Börja med Karin (Kvalitetschef) för överblick" }),
          new Paragraph({ text: "• Uppmuntra att prata med personer på 'golvet'" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "Fas 2: Analys (60-90 min)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Studenterna analyserar data i Excel" }),
          new Paragraph({ text: "• Skapa Ishikawa-diagram eller 5 Varför-analys" }),
          new Paragraph({ text: "• Identifiera och prioritera rotorsaker" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "Fas 3: Åtgärdsförslag (30-60 min)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Formulera konkreta åtgärder" }),
          new Paragraph({ text: "• Uppskatta kostnad och effekt" }),
          new Paragraph({ text: "• Förbereda presentation" }),
          new Paragraph({ text: "" }),

          // Bedömning
          new Paragraph({
            text: "7. Bedömningskriterier",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "• Antal identifierade rotorsaker (av 5)" }),
          new Paragraph({ text: "• Kvalitet på dataanalys (korrekta slutsatser från Excel)" }),
          new Paragraph({ text: "• Relevans och genomförbarhet av åtgärdsförslag" }),
          new Paragraph({ text: "• Koppling mellan rotorsak och åtgärd" }),
          new Paragraph({ text: "• Tidsplan och resursuppskattning" }),
          new Paragraph({ text: "" }),

          // Vanliga misstag
          new Paragraph({
            text: "8. Vanliga misstag att undvika",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "• Fokusera bara på ledningen - viktig info finns hos operatörer" }),
          new Paragraph({ text: "• Hoppa över dataanalys - Excel-filerna innehåller viktiga mönster" }),
          new Paragraph({ text: "• Skylla på individer - rotorsakerna är systemiska" }),
          new Paragraph({ text: "• Missa leverantörsproblematiken - Thomas är defensiv men har nyckeln" }),
          new Paragraph({ text: "" }),

          // Teknisk info
          new Paragraph({
            text: "9. Teknisk information",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "• URL: https://bright-light-simulation.vercel.app" }),
          new Paragraph({ text: "• Lärarvy: /teacher (se alla gruppers progress)" }),
          new Paragraph({ text: "• Varje grupp får en unik 6-teckens kod" }),
          new Paragraph({ text: "• All data sparas automatiskt" }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outputDir, "Lararhandledning_BLS.docx"), buffer);
  console.log("✓ Lärarhandledning skapad");
}

// ============================================
// STUDENTINSTRUKTION
// ============================================
async function generateStudentinstruktion() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "Studentinstruktion",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Bright Light Solutions - Kvalitetsutredning",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),

          // Bakgrund
          new Paragraph({
            text: "Bakgrund",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Ni har anlitats som konsulter av Bright Light Solutions AB, ett svenskt företag som tillverkar LED-belysning för industri och offentlig miljö. Företaget har drabbats av allvarliga kvalitetsproblem som hotar verksamheten.",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Uppdraget
          new Paragraph({
            text: "Ert uppdrag",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Reklamationskostnaderna har ökat dramatiskt - från 1.2 MSEK till 4.8 MSEK på bara 18 månader. VD Maria Ek har gett er i uppdrag att:",
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "1. Utreda vad som orsakar kvalitetsproblemen" }),
          new Paragraph({ text: "2. Identifiera de underliggande rotorsakerna" }),
          new Paragraph({ text: "3. Föreslå konkreta åtgärder inom budget" }),
          new Paragraph({ text: "" }),

          // Ramar
          new Paragraph({
            text: "Ramar för uppdraget",
            heading: HeadingLevel.HEADING_1,
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Budget", alignment: AlignmentType.LEFT })],
                    shading: { fill: "FFF3CD" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "800 000 kr", alignment: AlignmentType.LEFT })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Deadline", alignment: AlignmentType.LEFT })],
                    shading: { fill: "FFF3CD" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "6 månader", alignment: AlignmentType.LEFT })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Mål", alignment: AlignmentType.LEFT })],
                    shading: { fill: "FFF3CD" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Minska reklamationer med 50%", alignment: AlignmentType.LEFT })],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Så här fungerar simuleringen
          new Paragraph({
            text: "Så här fungerar simuleringen",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "1. Intervjua medarbetare",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "I simuleringen kan ni chatta med olika personer i organisationen. Varje person har olika kunskap och perspektiv. Ställ öppna frågor och följ upp intressanta spår.",
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "2. Ladda ner och analysera data",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "Vissa personer kan ge er tillgång till Excel-filer med data. Analysera dessa noggrant - de innehåller viktiga mönster.",
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "3. Formulera åtgärdsförslag",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "När ni identifierat rotorsakerna, formulera konkreta åtgärder. Tänk på kostnad, tidsplan och vem som är ansvarig.",
          }),
          new Paragraph({ text: "" }),

          // Tips
          new Paragraph({
            text: "Tips för framgång",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Börja brett ", bold: true }),
              new TextRun({ text: "- prata med olika nivåer i organisationen" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Lyssna på 'golvet' ", bold: true }),
              new TextRun({ text: "- operatörer ser ofta saker ledningen missar" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Följ upp ", bold: true }),
              new TextRun({ text: "- om någon nämner en annan person, prata med den" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Analysera datan ", bold: true }),
              new TextRun({ text: "- Excel-filerna avslöjar viktiga mönster" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Fråga om dokument ", bold: true }),
              new TextRun({ text: "- vissa har interna dokument som kan delas" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Sök systemfel ", bold: true }),
              new TextRun({ text: "- problemen beror sällan på enskilda personer" }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Roller
          new Paragraph({
            text: "Tillgängliga roller",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "Ledning:",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Maria Ek - VD och projektsponsor" }),
          new Paragraph({ text: "• Anna Berg - Ekonomichef" }),
          new Paragraph({ text: "• Henrik Wallin - Styrelserepresentant" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "Operativa chefer:",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Karin Lindström - Kvalitetschef (projektägare)" }),
          new Paragraph({ text: "• Thomas Gren - Inköpschef" }),
          new Paragraph({ text: "• Mikael Ström - Produktionschef" }),
          new Paragraph({ text: "• Peter Holm - HR-chef" }),
          new Paragraph({ text: "• Jonas Holm - Produktutvecklingschef" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "Medarbetare:",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Kenneth Johansson - Lödoperatör (dagskift)" }),
          new Paragraph({ text: "• Emma Lindqvist - Testoperatör (kvällsskift)" }),
          new Paragraph({ text: "• Linda Bergqvist - Facklig representant" }),
          new Paragraph({ text: "" }),

          // Leverabler
          new Paragraph({
            text: "Förväntade leverabler",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "1. Lista över identifierade rotorsaker (prioriterade)" }),
          new Paragraph({ text: "2. Åtgärdsförslag med:" }),
          new Paragraph({ text: "   - Beskrivning av åtgärden" }),
          new Paragraph({ text: "   - Koppling till rotorsak" }),
          new Paragraph({ text: "   - Uppskattad kostnad" }),
          new Paragraph({ text: "   - Ansvarig" }),
          new Paragraph({ text: "   - Tidsram" }),
          new Paragraph({ text: "3. Motivering av prioritering" }),
          new Paragraph({ text: "" }),

          // Starta
          new Paragraph({
            text: "Kom igång",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "1. Gå till: https://bright-light-simulation.vercel.app" }),
          new Paragraph({ text: "2. Registrera er grupp med gruppnamn och studentnamn" }),
          new Paragraph({ text: "3. Ni får en unik gruppkod - spara den!" }),
          new Paragraph({ text: "4. Börja intervjua och samla data" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Lycka till med ert konsultuppdrag!",
                bold: true,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outputDir, "Studentinstruktion_BLS.docx"), buffer);
  console.log("✓ Studentinstruktion skapad");
}

// ============================================
// POWERPOINT MED LÖSNINGSFÖRSLAG
// ============================================
async function generateLosningsforslag() {
  const pptx = new PptxGenJS();

  pptx.author = "Bright Light Solutions";
  pptx.title = "Lösningsförslag - Kvalitetsutredning";
  pptx.subject = "Facit och lösningsförslag för BLS-simuleringen";

  // Slide 1: Titel
  let slide = pptx.addSlide();
  slide.addText("Lösningsförslag", {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: "333333",
    align: "center",
  });
  slide.addText("Bright Light Solutions - Kvalitetsutredning", {
    x: 0.5,
    y: 2.7,
    w: 9,
    h: 0.5,
    fontSize: 24,
    color: "666666",
    align: "center",
  });
  slide.addText("ENDAST FÖR LÄRARE", {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 0.5,
    fontSize: 18,
    color: "CC0000",
    bold: true,
    align: "center",
  });

  // Slide 2: Sammanfattning av problemet
  slide = pptx.addSlide();
  slide.addText("Problemsammanfattning", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: "333333",
  });

  const problemData = [
    ["Mätpunkt", "2022", "2023", "2024"],
    ["Reklamationer", "289", "412", "847"],
    ["Kostnad (MSEK)", "1.2", "2.1", "4.8"],
    ["Kostnad/rek (kr)", "4 152", "5 097", "5 667"],
  ];

  slide.addTable(problemData, {
    x: 0.5,
    y: 1.2,
    w: 9,
    colW: [3, 2, 2, 2],
    border: { pt: 1, color: "CCCCCC" },
    fontFace: "Arial",
    fontSize: 14,
    color: "333333",
    fill: { color: "FFFFFF" },
    align: "center",
    valign: "middle",
  });

  slide.addText("Värst drabbade: IndustriLux 500W (46% av reklamationer)", {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 0.4,
    fontSize: 16,
    color: "CC0000",
  });

  // Slide 3: De 5 rotorsakerna
  slide = pptx.addSlide();
  slide.addText("Identifierade rotorsaker", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: "333333",
  });

  const rootCauseData = [
    ["#", "Rotorsak", "Impact", "Nyckelbevis"],
    ["1", "AsiaCore drivdon (undermålig MTBF)", "35%", "Leverantörsdata, Thomas mejl"],
    ["2", "Bristande JUKI-utbildning", "25%", "Utbildningsplan, Kenneth"],
    ["3", "Hög personalomsättning kvällsskift", "25%", "Personaldata, Emma/Peter"],
    ["4", "Bristande skiftöverlämning", "10%", "Skiftloggbok, Emma"],
    ["5", "Otillräcklig inkommande kontroll", "5%", "Karin, reklamationsdata"],
  ];

  slide.addTable(rootCauseData, {
    x: 0.3,
    y: 1.0,
    w: 9.4,
    colW: [0.5, 3.5, 1, 4.4],
    border: { pt: 1, color: "CCCCCC" },
    fontFace: "Arial",
    fontSize: 12,
    color: "333333",
    fill: { color: "FFFFFF" },
    valign: "middle",
  });

  // Slide 4: Rotorsak 1 - AsiaCore
  slide = pptx.addSlide();
  slide.addText("Rotorsak 1: AsiaCore drivdon", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: "333333",
  });
  slide.addText("Impact: 35% av problemet", {
    x: 0.5,
    y: 0.9,
    w: 9,
    h: 0.4,
    fontSize: 18,
    color: "CC0000",
  });

  slide.addText(
    "Beskrivning:\n" +
      "• 2022: Thomas bytte till AsiaCore för 30% lägre pris\n" +
      "• MTBF 35 000h istället för spec 50 000h\n" +
      "• AsiaCore står för 78% av alla drivdonsfel\n" +
      "• Mejl från Thomas bevisar medveten kompromiss",
    {
      x: 0.5,
      y: 1.5,
      w: 4.2,
      h: 2.5,
      fontSize: 14,
      color: "333333",
      valign: "top",
    }
  );

  slide.addText(
    "Åtgärdsförslag:\n" +
      "• Återgå till ElektroTech eller kvalificera ny leverantör\n" +
      "• Utöka inkommande kontroll till 100% för drivdon\n" +
      "• Uppskattad kostnad: 200 000 kr\n" +
      "• Effekt: ~35% minskning av reklamationer",
    {
      x: 5,
      y: 1.5,
      w: 4.5,
      h: 2.5,
      fontSize: 14,
      color: "333333",
      valign: "top",
    }
  );

  // Slide 5: Rotorsak 2 - Utbildning
  slide = pptx.addSlide();
  slide.addText("Rotorsak 2: Bristande JUKI-utbildning", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: "333333",
  });
  slide.addText("Impact: 25% av problemet", {
    x: 0.5,
    y: 0.9,
    w: 9,
    h: 0.4,
    fontSize: 18,
    color: "CC0000",
  });

  slide.addText(
    "Beskrivning:\n" +
      "• Ny JUKI-lödstation installerad feb 2023\n" +
      "• Rekommenderad utbildning: 5 dagar (40h)\n" +
      "• Genomförd utbildning: 2 halvdagar (8h)\n" +
      "• Kvällsskiftet har ingen senior JUKI-operatör",
    {
      x: 0.5,
      y: 1.5,
      w: 4.2,
      h: 2.5,
      fontSize: 14,
      color: "333333",
      valign: "top",
    }
  );

  slide.addText(
    "Åtgärdsförslag:\n" +
      "• Genomför full utbildning med Anders Krantz (JUKI)\n" +
      "• Skapa interna certifieringskrav\n" +
      "• Uppskattad kostnad: 150 000 kr\n" +
      "• Effekt: ~25% minskning av monteringsfel",
    {
      x: 5,
      y: 1.5,
      w: 4.5,
      h: 2.5,
      fontSize: 14,
      color: "333333",
      valign: "top",
    }
  );

  // Slide 6: Rotorsak 3 - Personalomsättning
  slide = pptx.addSlide();
  slide.addText("Rotorsak 3: Hög personalomsättning kvällsskift", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: "333333",
  });
  slide.addText("Impact: 25% av problemet", {
    x: 0.5,
    y: 0.9,
    w: 9,
    h: 0.4,
    fontSize: 18,
    color: "CC0000",
  });

  slide.addText(
    "Beskrivning:\n" +
      "• Kvällsskift: 35% omsättning vs 8% dagskift\n" +
      "• Snitt anställningstid kväll: 8 månader\n" +
      "• Kvällsskift står för 60% av monteringsfel\n" +
      "• Exitintervjuer: stress, dålig upplärning",
    {
      x: 0.5,
      y: 1.5,
      w: 4.2,
      h: 2.5,
      fontSize: 14,
      color: "333333",
      valign: "top",
    }
  );

  slide.addText(
    "Åtgärdsförslag:\n" +
      "• Strukturerat mentorprogram dag→kväll\n" +
      "• Förbättrade arbetsvillkor kvällsskift\n" +
      "• Minst 1 senior operatör per skift\n" +
      "• Uppskattad kostnad: 250 000 kr\n" +
      "• Effekt: Minskad omsättning, färre fel",
    {
      x: 5,
      y: 1.5,
      w: 4.5,
      h: 2.5,
      fontSize: 14,
      color: "333333",
      valign: "top",
    }
  );

  // Slide 7: Rotorsak 4 & 5
  slide = pptx.addSlide();
  slide.addText("Rotorsaker 4 & 5", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: "333333",
  });

  slide.addText(
    "4. Bristande skiftöverlämning (10%)\n\n" +
      "Problem:\n" +
      "• Överlappning minskad från 30 till 15 min\n" +
      "• Information faller mellan stolarna\n\n" +
      "Åtgärd:\n" +
      "• Återställ 30 min överlappning\n" +
      "• Strukturerad överlämningschecklista\n" +
      "• Kostnad: 100 000 kr/år (arbetstid)",
    {
      x: 0.5,
      y: 1.0,
      w: 4.2,
      h: 3.5,
      fontSize: 13,
      color: "333333",
      valign: "top",
    }
  );

  slide.addText(
    "5. Otillräcklig inkommande kontroll (5%)\n\n" +
      "Problem:\n" +
      "• Endast 5% stickprov på drivdon\n" +
      "• Bristfälliga komponenter upptäcks inte\n\n" +
      "Åtgärd:\n" +
      "• 100% kontroll av kritiska komponenter\n" +
      "• AQL-system för övriga\n" +
      "• Kostnad: 100 000 kr (utrustning + tid)",
    {
      x: 5,
      y: 1.0,
      w: 4.5,
      h: 3.5,
      fontSize: 13,
      color: "333333",
      valign: "top",
    }
  );

  // Slide 8: Åtgärdsplan sammanfattning
  slide = pptx.addSlide();
  slide.addText("Sammanställning åtgärdsplan", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: "333333",
  });

  const actionData = [
    ["Åtgärd", "Kostnad", "Effekt", "Tid"],
    ["Byt leverantör/utöka kontroll", "200 000 kr", "35%", "3 mån"],
    ["JUKI-utbildning", "150 000 kr", "25%", "2 mån"],
    ["Mentorprogram + villkor", "250 000 kr", "25%", "6 mån"],
    ["Utökad överlämning", "100 000 kr", "10%", "1 mån"],
    ["Inkommande kontroll", "100 000 kr", "5%", "2 mån"],
    ["TOTALT", "800 000 kr", "100%", ""],
  ];

  slide.addTable(actionData, {
    x: 0.5,
    y: 1.0,
    w: 9,
    colW: [4, 2, 1.5, 1.5],
    border: { pt: 1, color: "CCCCCC" },
    fontFace: "Arial",
    fontSize: 13,
    color: "333333",
    fill: { color: "FFFFFF" },
    valign: "middle",
  });

  slide.addText("✓ Inom budget (800 000 kr)\n✓ Adresserar alla rotorsaker\n✓ Genomförbart inom 6 månader", {
    x: 0.5,
    y: 3.8,
    w: 9,
    h: 1,
    fontSize: 16,
    color: "006600",
    bold: true,
  });

  // Slide 9: Viktiga datapunkter
  slide = pptx.addSlide();
  slide.addText("Viktiga datapunkter från Excel", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: "333333",
  });

  slide.addText(
    "Reklamationsdata:\n" +
      "• 78% av drivdonsfel från AsiaCore\n" +
      "• 60% av monteringsfel från kvällsskift\n" +
      "• IndustriLux 500W = 46% av alla reklamationer\n\n" +
      "Leverantörsdata:\n" +
      "• AsiaCore MTBF: 35 000h (spec: 50 000h)\n" +
      "• AsiaCore felfrekvens: 4.8% (spec: <2%)\n" +
      "• Pris: 340 kr vs ElektroTech 485 kr",
    {
      x: 0.5,
      y: 1.0,
      w: 4.2,
      h: 3.5,
      fontSize: 13,
      color: "333333",
      valign: "top",
    }
  );

  slide.addText(
    "Personaldata:\n" +
      "• Kvällsskift omsättning: 35%\n" +
      "• Dagskift omsättning: 8%\n" +
      "• Snitt anställningstid kväll: 1.4 år\n\n" +
      "Utbildningsdata:\n" +
      "• JUKI rekommenderat: 40h\n" +
      "• JUKI genomfört: 8h\n" +
      "• Gap: 32 timmar",
    {
      x: 5,
      y: 1.0,
      w: 4.5,
      h: 3.5,
      fontSize: 13,
      color: "333333",
      valign: "top",
    }
  );

  // Slide 10: Intervjutips
  slide = pptx.addSlide();
  slide.addText("Intervjutips - vem avslöjar vad?", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: "333333",
  });

  const interviewData = [
    ["Person", "Avslöjar", "Svårighetsgrad"],
    ["Karin (Kvalitet)", "Överblick, pekar mot data", "Lätt"],
    ["Thomas (Inköp)", "AsiaCore-mejlet (om pressad)", "Svår"],
    ["Mikael (Produktion)", "Kvällsskiftsproblem, JUKI", "Medium"],
    ["Kenneth (Operatör dag)", "JUKI-problem, skiftkaos", "Lätt"],
    ["Emma (Operatör kväll)", "Frustration, överlämning", "Lätt"],
    ["Peter (HR)", "Omsättningsdata", "Medium"],
    ["Anders (JUKI-extern)", "Utbildningsgap", "Fas 2"],
  ];

  slide.addTable(interviewData, {
    x: 0.5,
    y: 1.0,
    w: 9,
    colW: [3, 4, 2],
    border: { pt: 1, color: "CCCCCC" },
    fontFace: "Arial",
    fontSize: 12,
    color: "333333",
    fill: { color: "FFFFFF" },
    valign: "middle",
  });

  // Spara
  const buffer = await pptx.write({ outputType: "nodebuffer" });
  fs.writeFileSync(path.join(outputDir, "Losningsforslag_BLS.pptx"), buffer as Buffer);
  console.log("✓ PowerPoint lösningsförslag skapad");
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log("Genererar dokument...\n");

  await generateLararhandledning();
  await generateStudentinstruktion();
  await generateLosningsforslag();

  console.log(`\n✓ Alla dokument skapade i: ${outputDir}`);
}

main().catch(console.error);
