import * as XLSX from 'xlsx';

// Data file definitions
export const dataFiles = {
  reklamationer: {
    name: 'Reklamationsdata 2023-2025',
    filename: 'reklamationsdata.xlsx',
    description: 'Alla reklamationer med ID, datum, produkt, feltyp, kostnad, skift, leverantör',
  },
  produktion: {
    name: 'Produktionsstatistik',
    filename: 'produktionsdata.xlsx',
    description: 'Veckovis data per linje, skift, operatör',
  },
  leverantorer: {
    name: 'Leverantörsanalys',
    filename: 'leverantorsdata.xlsx',
    description: 'Jämförelse ElektroTech vs AsiaCore, pris, kvalitet, MTBF',
  },
  ekonomi: {
    name: 'Ekonomisk analys',
    filename: 'ekonomidata.xlsx',
    description: 'Kostnadsfördelning, ROI-kalkyler, budgethistorik',
  },
  personal: {
    name: 'Personalstatistik',
    filename: 'personaldata.xlsx',
    description: 'Omsättning per skift, utbildningsnivåer, anställningstid',
  },
};

// Helper functions
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Generate reklamationsdata - 847 rows showing patterns that support root causes
export function generateReklamationsdata(): XLSX.WorkBook {
  const products = [
    { name: 'IndustriLux 500W', weight: 0.46 },
    { name: 'IndustriLux 300W', weight: 0.15 },
    { name: 'StreetLight Pro', weight: 0.32 },
    { name: 'SportArena', weight: 0.13 },
    { name: 'ParkZone', weight: 0.09 },
  ];

  const feltyper = [
    { name: 'Ljusflimmer', weight: 0.29 },
    { name: 'Tidig utbränning', weight: 0.24 },
    { name: 'Drivdonshaveri', weight: 0.18 },
    { name: 'Fuktinträngning', weight: 0.16 },
    { name: 'Mekaniskt fel', weight: 0.13 },
  ];

  const rows = [];
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2025-12-31');

  for (let i = 1; i <= 847; i++) {
    const date = randomDate(startDate, endDate);
    const year = date.getFullYear();
    const month = date.getMonth();

    // More reklamations in 2024-2025
    if (year === 2023 && Math.random() > 0.5) continue;

    // Weight towards problematic products
    let product = '';
    const productRoll = Math.random();
    let cumulative = 0;
    for (const p of products) {
      cumulative += p.weight;
      if (productRoll <= cumulative) {
        product = p.name;
        break;
      }
    }

    // Weight towards specific fel types
    let feltyp = '';
    const felRoll = Math.random();
    cumulative = 0;
    for (const f of feltyper) {
      cumulative += f.weight;
      if (felRoll <= cumulative) {
        feltyp = f.name;
        break;
      }
    }

    // Shift - evening shift has more issues (60% of assembly errors)
    const isAssemblyError = feltyp === 'Ljusflimmer' || feltyp === 'Drivdonshaveri';
    const skift = isAssemblyError
      ? (Math.random() < 0.6 ? 'Kväll' : 'Dag')
      : randomChoice(['Dag', 'Kväll']);

    // Supplier - AsiaCore has more issues (78% of driver failures)
    const isDriverIssue = feltyp === 'Drivdonshaveri' || feltyp === 'Tidig utbränning';
    let leverantor = 'N/A';
    if (isDriverIssue) {
      leverantor = Math.random() < 0.78 ? 'AsiaCore' : 'ElektroTech';
    }

    // Cost varies by product and issue
    const baseCost = product === 'IndustriLux 500W' ? 7500 : 4500;
    const kostnad = Math.round(baseCost * (0.8 + Math.random() * 0.4));

    // Batch - Q2 and Q3 2025 have more issues
    let batch = `${year}-Q${Math.ceil((month + 1) / 3)}`;
    if (leverantor === 'AsiaCore' && year >= 2024) {
      batch += `-AC-${1000 + Math.floor(Math.random() * 500)}`;
    }

    rows.push({
      'Reklamations-ID': `REK-${String(i).padStart(5, '0')}`,
      'Datum': formatDate(date),
      'Produkt': product,
      'Feltyp': feltyp,
      'Kostnad (SEK)': kostnad,
      'Skift': skift,
      'Leverantör (drivdon)': leverantor,
      'Batch': batch,
      'Status': 'Stängd',
    });
  }

  // Sort by date
  rows.sort((a, b) => a['Datum'].localeCompare(b['Datum']));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reklamationer');

  return workbook;
}

// Generate produktionsdata
export function generateProduktionsdata(): XLSX.WorkBook {
  const rows = [];
  const startDate = new Date('2024-01-01');

  for (let week = 1; week <= 52; week++) {
    const weekDate = new Date(startDate);
    weekDate.setDate(weekDate.getDate() + (week - 1) * 7);

    // Day shift - more experienced, fewer errors
    rows.push({
      'Vecka': week,
      'År': 2024,
      'Skift': 'Dag',
      'Linje': 'Linje 1',
      'Producerat': Math.round(85 + Math.random() * 20),
      'Omarbeten': Math.round(2 + Math.random() * 4),
      'Kassationer': Math.round(1 + Math.random() * 2),
      'OEE (%)': Math.round(78 + Math.random() * 12),
    });

    // Evening shift - less experienced, more errors
    rows.push({
      'Vecka': week,
      'År': 2024,
      'Skift': 'Kväll',
      'Linje': 'Linje 1',
      'Producerat': Math.round(75 + Math.random() * 15),
      'Omarbeten': Math.round(5 + Math.random() * 8),
      'Kassationer': Math.round(2 + Math.random() * 4),
      'OEE (%)': Math.round(65 + Math.random() * 15),
    });

    // Line 3 - JUKI station, more variation
    rows.push({
      'Vecka': week,
      'År': 2024,
      'Skift': 'Dag',
      'Linje': 'Linje 3 (JUKI)',
      'Producerat': Math.round(70 + Math.random() * 20),
      'Omarbeten': Math.round(3 + Math.random() * 5),
      'Kassationer': Math.round(1 + Math.random() * 3),
      'OEE (%)': Math.round(72 + Math.random() * 15),
    });

    rows.push({
      'Vecka': week,
      'År': 2024,
      'Skift': 'Kväll',
      'Linje': 'Linje 3 (JUKI)',
      'Producerat': Math.round(60 + Math.random() * 15),
      'Omarbeten': Math.round(7 + Math.random() * 10),
      'Kassationer': Math.round(3 + Math.random() * 5),
      'OEE (%)': Math.round(58 + Math.random() * 15),
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Produktion');

  return workbook;
}

// Generate leverantörsdata
export function generateLeverantorsdata(): XLSX.WorkBook {
  const comparison = [
    {
      'Parameter': 'MTBF (timmar)',
      'ElektroTech': 55000,
      'AsiaCore': 35000,
      'Specifikation': 50000,
      'Kommentar': 'AsiaCore under spec!',
    },
    {
      'Parameter': 'Pris per enhet (SEK)',
      'ElektroTech': 485,
      'AsiaCore': 340,
      'Specifikation': '-',
      'Kommentar': '30% billigare',
    },
    {
      'Parameter': 'Leveranstid (dagar)',
      'ElektroTech': 14,
      'AsiaCore': 28,
      'Specifikation': 21,
      'Kommentar': '',
    },
    {
      'Parameter': 'Felfrekvens (%)',
      'ElektroTech': 1.2,
      'AsiaCore': 4.8,
      'Specifikation': '<2%',
      'Kommentar': 'AsiaCore över spec',
    },
    {
      'Parameter': 'ISO 9001',
      'ElektroTech': 'Ja',
      'AsiaCore': 'Ja',
      'Specifikation': 'Krav',
      'Kommentar': '',
    },
    {
      'Parameter': 'Platsbesök genomfört',
      'ElektroTech': 'Ja (2021)',
      'AsiaCore': 'Nej (distans)',
      'Specifikation': 'Rekommenderas',
      'Kommentar': 'Covid-undantag',
    },
  ];

  const historik = [
    { 'År': 2022, 'ElektroTech (%)': 100, 'AsiaCore (%)': 0 },
    { 'År': 2023, 'ElektroTech (%)': 80, 'AsiaCore (%)': 20 },
    { 'År': 2024, 'ElektroTech (%)': 55, 'AsiaCore (%)': 45 },
    { 'År': 2025, 'ElektroTech (%)': 40, 'AsiaCore (%)': 60 },
  ];

  const workbook = XLSX.utils.book_new();

  const compSheet = XLSX.utils.json_to_sheet(comparison);
  XLSX.utils.book_append_sheet(workbook, compSheet, 'Jämförelse');

  const histSheet = XLSX.utils.json_to_sheet(historik);
  XLSX.utils.book_append_sheet(workbook, histSheet, 'Leverantörsfördelning');

  return workbook;
}

// Generate ekonomidata
export function generateEkonomidata(): XLSX.WorkBook {
  const kostnader = [
    { 'Kategori': 'Ersättningsprodukter', 'Belopp (MSEK)': 1.87, 'Andel (%)': 39 },
    { 'Kategori': 'Frakt & logistik', 'Belopp (MSEK)': 0.72, 'Andel (%)': 15 },
    { 'Kategori': 'Arbetstid (hantering)', 'Belopp (MSEK)': 0.67, 'Andel (%)': 14 },
    { 'Kategori': 'Reparation', 'Belopp (MSEK)': 0.58, 'Andel (%)': 12 },
    { 'Kategori': 'Kundkompensation', 'Belopp (MSEK)': 0.48, 'Andel (%)': 10 },
    { 'Kategori': 'Administration', 'Belopp (MSEK)': 0.48, 'Andel (%)': 10 },
    { 'Kategori': 'TOTALT', 'Belopp (MSEK)': 4.8, 'Andel (%)': 100 },
  ];

  const historik = [
    { 'År': 2022, 'Reklamationskostnad (MSEK)': 1.2, 'Antal reklamationer': 289, 'Kostnad/reklamation': 4152 },
    { 'År': 2023, 'Reklamationskostnad (MSEK)': 2.1, 'Antal reklamationer': 412, 'Kostnad/reklamation': 5097 },
    { 'År': 2024, 'Reklamationskostnad (MSEK)': 4.8, 'Antal reklamationer': 847, 'Kostnad/reklamation': 5667 },
  ];

  const besparingar = [
    { 'Åtgärd': 'Komponentbesparing 2022', 'Besparing (MSEK)': 3.8, 'Status': 'Genomförd' },
    { 'Åtgärd': 'Reklamationskostnadsökning', 'Besparing (MSEK)': -2.7, 'Status': 'Faktisk kostnad' },
    { 'Åtgärd': 'Nettoresultat', 'Besparing (MSEK)': 1.1, 'Status': 'Krympande' },
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(kostnader), 'Kostnadsfördelning');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(historik), 'Historik');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(besparingar), 'Besparingsanalys');

  return workbook;
}

// Generate personaldata
export function generatePersonaldata(): XLSX.WorkBook {
  const omsattning = [
    { 'Avdelning': 'Produktion - Dagskift', 'Antal anställda': 35, 'Omsättning (%)': 8, 'Snitt anställningstid (år)': 7.2 },
    { 'Avdelning': 'Produktion - Kvällsskift', 'Antal anställda': 17, 'Omsättning (%)': 35, 'Snitt anställningstid (år)': 1.4 },
    { 'Avdelning': 'Kvalitet', 'Antal anställda': 8, 'Omsättning (%)': 5, 'Snitt anställningstid (år)': 6.8 },
    { 'Avdelning': 'Inköp', 'Antal anställda': 6, 'Omsättning (%)': 12, 'Snitt anställningstid (år)': 3.2 },
    { 'Avdelning': 'Administration', 'Antal anställda': 24, 'Omsättning (%)': 8, 'Snitt anställningstid (år)': 5.5 },
    { 'Avdelning': 'TOTALT', 'Antal anställda': 145, 'Omsättning (%)': 12, 'Snitt anställningstid (år)': 4.8 },
  ];

  const kvallsskift = [
    { 'Anställningstid': '0-6 månader', 'Antal': 6, 'Andel (%)': 35 },
    { 'Anställningstid': '6-12 månader', 'Antal': 5, 'Andel (%)': 29 },
    { 'Anställningstid': '1-2 år', 'Antal': 4, 'Andel (%)': 24 },
    { 'Anställningstid': '>2 år', 'Antal': 2, 'Andel (%)': 12 },
  ];

  const utbildning = [
    { 'Utbildning': 'JUKI SMT-station', 'Rekommenderat': '5 dagar', 'Genomfört': '2 halvdagar', 'Gap': '3.5 dagar' },
    { 'Utbildning': 'IndustriLux 500W', 'Rekommenderat': '2 dagar', 'Genomfört': '0.5 dag', 'Gap': '1.5 dagar' },
    { 'Utbildning': 'Kvalitetskontroll', 'Rekommenderat': '3 dagar', 'Genomfört': '1 dag', 'Gap': '2 dagar' },
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(omsattning), 'Omsättning');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(kvallsskift), 'Kvällsskift');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(utbildning), 'Utbildning');

  return workbook;
}

// Main function to generate a specific data file
export function generateDataFile(fileId: string): { buffer: Buffer; filename: string } | null {
  let workbook: XLSX.WorkBook;
  let filename: string;

  switch (fileId) {
    case 'reklamationer':
      workbook = generateReklamationsdata();
      filename = 'reklamationsdata.xlsx';
      break;
    case 'produktion':
      workbook = generateProduktionsdata();
      filename = 'produktionsdata.xlsx';
      break;
    case 'leverantorer':
      workbook = generateLeverantorsdata();
      filename = 'leverantorsdata.xlsx';
      break;
    case 'ekonomi':
      workbook = generateEkonomidata();
      filename = 'ekonomidata.xlsx';
      break;
    case 'personal':
      workbook = generatePersonaldata();
      filename = 'personaldata.xlsx';
      break;
    default:
      return null;
  }

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return { buffer, filename };
}
