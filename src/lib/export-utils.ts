import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

// Export element as PNG image
export async function exportAsImage(elementId: string, filename: string): Promise<Blob> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element ${elementId} not found`);

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/png');
  });
}

// Export element as PDF
export async function exportAsPDF(elementId: string, filename: string, title?: string): Promise<Blob> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element ${elementId} not found`);

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'mm',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Add title if provided
  if (title) {
    pdf.setFontSize(16);
    pdf.text(title, 10, 15);
  }

  const startY = title ? 25 : 10;
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 10, startY, imgWidth, Math.min(imgHeight, pageHeight - startY - 10));

  return pdf.output('blob');
}

// Export data as Excel
export function exportAsExcel<T extends Record<string, unknown>>(data: T[], filename: string, sheetName = 'Data'): Blob {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// Export as JSON
export function exportAsJSON<T>(data: T, filename: string): Blob {
  const jsonString = JSON.stringify(data, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

// Generate final report PDF
export async function generateFinalReportPDF(
  groupData: {
    name: string;
    code: string;
    studentNames: string;
    phase: number;
  },
  activityLog: Array<{ timestamp: string; action: string; detail: string }>,
  interviews: Array<{ roleId: string; questionsAsked: number }>,
  downloads: Array<{ fileId: string }>,
  proposals: Array<{ rootCauseId: string; description: string; responsible?: string | null; cost?: number | null }>
): Promise<Blob> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(234, 179, 8); // Yellow
  pdf.text('Bright Light Solutions', pageWidth / 2, 25, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Kvalitets- och Projektledningssimulering', pageWidth / 2, 35, { align: 'center' });
  pdf.text('Slutrapport', pageWidth / 2, 45, { align: 'center' });

  // Group info
  pdf.setFontSize(12);
  let y = 60;
  pdf.text(`Grupp: ${groupData.name}`, 15, y);
  y += 8;
  pdf.text(`Gruppkod: ${groupData.code}`, 15, y);
  y += 8;
  pdf.text(`Studenter: ${groupData.studentNames}`, 15, y);
  y += 8;
  pdf.text(`Fas: ${groupData.phase}`, 15, y);
  y += 8;
  pdf.text(`Datum: ${new Date().toLocaleDateString('sv-SE')}`, 15, y);

  // Statistics
  y += 15;
  pdf.setFontSize(14);
  pdf.text('Sammanfattning', 15, y);
  y += 10;
  pdf.setFontSize(11);
  pdf.text(`Antal intervjuer genomförda: ${interviews.length}`, 20, y);
  y += 7;
  pdf.text(`Antal datafiler nedladdade: ${downloads.length}`, 20, y);
  y += 7;
  pdf.text(`Antal åtgärdsförslag: ${proposals.length}`, 20, y);
  y += 7;
  pdf.text(`Totalt loggade aktiviteter: ${activityLog.length}`, 20, y);

  // Proposals
  if (proposals.length > 0) {
    y += 15;
    pdf.setFontSize(14);
    pdf.text('Åtgärdsförslag', 15, y);
    y += 10;
    pdf.setFontSize(10);

    proposals.forEach((proposal, index) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(`${index + 1}. ${proposal.rootCauseId}`, 20, y);
      y += 5;

      // Wrap long description
      const lines = pdf.splitTextToSize(proposal.description, pageWidth - 45);
      lines.forEach((line: string) => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, 25, y);
        y += 5;
      });

      if (proposal.responsible) {
        pdf.text(`Ansvarig: ${proposal.responsible}`, 25, y);
        y += 5;
      }
      if (proposal.cost) {
        pdf.text(`Kostnad: ${proposal.cost.toLocaleString()} SEK`, 25, y);
        y += 5;
      }
      y += 5;
    });
  }

  // Activity log summary
  pdf.addPage();
  y = 20;
  pdf.setFontSize(14);
  pdf.text('Aktivitetslogg (senaste 20)', 15, y);
  y += 10;
  pdf.setFontSize(9);

  const recentActivities = activityLog.slice(0, 20);
  recentActivities.forEach((log) => {
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
    const timestamp = new Date(log.timestamp).toLocaleString('sv-SE');
    pdf.text(`${timestamp} - ${log.action}: ${log.detail}`, 15, y);
    y += 6;
  });

  return pdf.output('blob');
}

// Create ZIP with all exports
export async function createExportZip(
  groupCode: string,
  files: Array<{ name: string; blob: Blob }>
): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.name, file.blob);
  }

  return zip.generateAsync({ type: 'blob' });
}

// Trigger download
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
