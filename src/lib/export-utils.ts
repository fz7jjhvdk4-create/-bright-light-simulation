import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

// Capture the FULL content of an element — including anything hidden behind
// scrollbars (issue #4). html2canvas photographs the element as displayed, so
// we render an off-screen clone with every overflow unclipped and shoot that.
async function captureFullElement(elementId: string): Promise<HTMLCanvasElement> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element ${elementId} not found`);

  const baseWidth = Math.max(element.scrollWidth, element.clientWidth);

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-100000px';
  wrapper.style.top = '0';
  wrapper.style.width = `${baseWidth}px`;
  wrapper.style.background = '#ffffff';

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${baseWidth}px`;
  clone.style.height = 'auto';
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';
  clone.querySelectorAll<HTMLElement>('*').forEach(el => {
    el.style.overflow = 'visible';
    el.style.maxHeight = 'none';
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Exports should always be light/printable regardless of the chosen theme —
  // temporarily lift the dark class during the capture
  const root = document.documentElement;
  const hadDarkTheme = root.classList.contains('dark');
  if (hadDarkTheme) root.classList.remove('dark');

  try {
    // Wide inner content (e.g. the Gantt timeline) may exceed the element's
    // own width — grow the clone to the widest descendant before capturing
    const fullWidth = Math.max(clone.scrollWidth, baseWidth);
    clone.style.width = `${fullWidth}px`;
    wrapper.style.width = `${fullWidth}px`;

    return await html2canvas(clone, {
      backgroundColor: '#ffffff',
      scale: 2,
      windowWidth: fullWidth,
    });
  } finally {
    if (hadDarkTheme) root.classList.add('dark');
    wrapper.remove();
  }
}

// Export element as PNG image
export async function exportAsImage(elementId: string, filename: string): Promise<Blob> {
  const canvas = await captureFullElement(elementId);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/png');
  });
}

// Export element as PDF, split across A4 pages when the content is taller
// than one page (previously tall content was clipped to a single page)
export async function exportAsPDF(elementId: string, filename: string, title?: string): Promise<Blob> {
  const canvas = await captureFullElement(elementId);

  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;

  if (title) {
    pdf.setFontSize(16);
    pdf.text(title, margin, 15);
  }

  const imgWidth = pageWidth - margin * 2;
  const pxPerMm = canvas.width / imgWidth;

  let renderedPx = 0;
  let page = 0;
  while (renderedPx < canvas.height) {
    const topY = page === 0 ? (title ? 25 : margin) : margin;
    const availablePx = Math.floor((pageHeight - topY - margin) * pxPerMm);
    const slicePx = Math.min(canvas.height - renderedPx, availablePx);

    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = slicePx;
    const ctx = slice.getContext('2d');
    if (!ctx) throw new Error('Kunde inte skapa canvas för PDF-export');
    ctx.drawImage(canvas, 0, renderedPx, canvas.width, slicePx, 0, 0, canvas.width, slicePx);

    if (page > 0) pdf.addPage();
    pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, topY, imgWidth, slicePx / pxPerMm);

    renderedPx += slicePx;
    page++;
  }

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
