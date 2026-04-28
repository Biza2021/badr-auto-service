import { formatDate } from "@/lib/format";
import { fallbackGarageSettings, type GarageSettingsView } from "@/lib/garage-settings";
import {
  InvoiceDocumentData,
  formatMad,
  invoiceLineTotal,
  invoiceRemainingBalance,
  invoiceVehicleLabel
} from "@/lib/invoice";
import { invoiceLineTypeLabels, paymentStatusLabels } from "@/lib/status";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 40;

type PdfPage = {
  commands: string[];
};

function sanitizePdfText(value: string) {
  return value
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/\u00a0/g, " ")
    .replace(/[^\x09\x0a\x0d\x20-\xff]/g, "");
}

function escapePdfText(value: string) {
  return sanitizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function pdfY(top: number) {
  return PAGE_HEIGHT - top;
}

function textWidth(value: string, size: number) {
  return sanitizePdfText(value).length * size * 0.48;
}

function wrapText(value: string, maxChars: number) {
  const words = sanitizePdfText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function addText(page: PdfPage, x: number, top: number, size: number, value: string, font = "F1") {
  page.commands.push(`BT /${font} ${size} Tf ${x} ${pdfY(top)} Td (${escapePdfText(value)}) Tj ET`);
}

function addRightText(page: PdfPage, right: number, top: number, size: number, value: string, font = "F1") {
  addText(page, right - textWidth(value, size), top, size, value, font);
}

function addLine(page: PdfPage, x1: number, top: number, x2: number) {
  const y = pdfY(top);
  page.commands.push(`0.86 0.88 0.91 RG 0.8 w ${x1} ${y} m ${x2} ${y} l S`);
}

function addRect(page: PdfPage, x: number, top: number, width: number, height: number, color: string) {
  page.commands.push(`q ${color} rg ${x} ${pdfY(top + height)} ${width} ${height} re f Q`);
}

function addHeader(page: PdfPage, invoice: InvoiceDocumentData, settings: GarageSettingsView, compact = false) {
  addRect(page, 0, 0, PAGE_WIDTH, compact ? 64 : 96, "0.05 0.09 0.18");
  addText(page, MARGIN, compact ? 34 : 42, compact ? 17 : 22, settings.garageName, "F2");
  addText(page, MARGIN, compact ? 52 : 62, 10, settings.address);
  addRightText(page, PAGE_WIDTH - MARGIN, compact ? 34 : 42, compact ? 12 : 14, `Facture ${invoice.invoiceNumber}`, "F2");
  addRightText(page, PAGE_WIDTH - MARGIN, compact ? 52 : 62, 10, `Date : ${formatDate(invoice.createdAt)}`);
}

function createPage(invoice: InvoiceDocumentData, settings: GarageSettingsView, compactHeader = true): PdfPage {
  const page = { commands: [] };
  addHeader(page, invoice, settings, compactHeader);
  return page;
}

export function generateInvoicePdf(invoice: InvoiceDocumentData, settings: GarageSettingsView = fallbackGarageSettings) {
  const pages: PdfPage[] = [];
  let page = createPage(invoice, settings, false);
  pages.push(page);
  let top = 125;

  const ensureSpace = (height: number) => {
    if (top + height < PAGE_HEIGHT - 55) return;
    page = createPage(invoice, settings, true);
    pages.push(page);
    top = 90;
  };

  addText(page, MARGIN, top, 11, "Client", "F2");
  addText(page, MARGIN, top + 18, 16, invoice.customer.fullName, "F2");
  addText(page, MARGIN, top + 38, 10, `Téléphone : ${invoice.customer.phone ?? "Non renseigné"}`);

  const metaX = 330;
  addText(page, metaX, top, 11, "Dossier", "F2");
  addText(page, metaX, top + 18, 10, `Véhicule : ${invoiceVehicleLabel(invoice)}`);
  addText(page, metaX, top + 34, 10, `Référence réparation : ${invoice.repair.trackingCode}`);
  addText(page, metaX, top + 50, 10, `Statut paiement : ${paymentStatusLabels[invoice.status]}`);
  top += 85;

  addLine(page, MARGIN, top, PAGE_WIDTH - MARGIN);
  top += 24;

  addRect(page, MARGIN, top - 14, PAGE_WIDTH - MARGIN * 2, 28, "0.95 0.97 0.99");
  addText(page, MARGIN + 8, top + 4, 9, "Type", "F2");
  addText(page, MARGIN + 82, top + 4, 9, "Description", "F2");
  addRightText(page, 390, top + 4, 9, "Qté", "F2");
  addRightText(page, 472, top + 4, 9, "Prix unit.", "F2");
  addRightText(page, PAGE_WIDTH - MARGIN - 8, top + 4, 9, "Total", "F2");
  top += 28;

  for (const line of invoice.lines) {
    const descriptionLines = wrapText(line.description, 38);
    const rowHeight = Math.max(30, descriptionLines.length * 13 + 14);
    ensureSpace(rowHeight + 10);

    addText(page, MARGIN + 8, top, 9, invoiceLineTypeLabels[line.type as keyof typeof invoiceLineTypeLabels] ?? line.type);
    descriptionLines.forEach((description, index) => {
      addText(page, MARGIN + 82, top + index * 13, 9, description);
    });
    addRightText(page, 390, top, 9, String(line.quantity));
    addRightText(page, 472, top, 9, formatMad(line.unitPrice));
    addRightText(page, PAGE_WIDTH - MARGIN - 8, top, 9, formatMad(invoiceLineTotal(line)));
    addLine(page, MARGIN, top + rowHeight - 10, PAGE_WIDTH - MARGIN);
    top += rowHeight;
  }

  ensureSpace(115);
  top += 10;
  const totalsX = 345;
  addText(page, totalsX, top, 10, "Total", "F2");
  addRightText(page, PAGE_WIDTH - MARGIN, top, 10, formatMad(invoice.totalAmount), "F2");
  addText(page, totalsX, top + 20, 10, "Montant payé");
  addRightText(page, PAGE_WIDTH - MARGIN, top + 20, 10, formatMad(invoice.paidAmount));
  addLine(page, totalsX, top + 34, PAGE_WIDTH - MARGIN);
  addText(page, totalsX, top + 52, 11, "Reste à payer", "F2");
  addRightText(page, PAGE_WIDTH - MARGIN, top + 52, 11, formatMad(invoiceRemainingBalance(invoice)), "F2");
  addText(page, MARGIN, PAGE_HEIGHT - 35, 9, `Merci pour votre confiance. ${settings.garageName}.`);

  return buildPdf(pages);
}

function buildPdf(pages: PdfPage[]) {
  const objects: Buffer[] = [];
  const fontObjectId = 3 + pages.length * 2;
  const kids = pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ");

  objects[1] = Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "latin1");
  objects[2] = Buffer.from(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`, "latin1");

  pages.forEach((page, index) => {
    const pageObjectId = 3 + index * 2;
    const contentObjectId = pageObjectId + 1;
    const contentBuffer = Buffer.from(page.commands.join("\n"), "latin1");
    objects[pageObjectId] = Buffer.from(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObjectId} 0 R /F2 ${fontObjectId + 1} 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
      "latin1"
    );
    objects[contentObjectId] = Buffer.concat([
      Buffer.from(`<< /Length ${contentBuffer.length} >>\nstream\n`, "latin1"),
      contentBuffer,
      Buffer.from("\nendstream", "latin1")
    ]);
  });

  objects[fontObjectId] = Buffer.from(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "latin1"
  );
  objects[fontObjectId + 1] = Buffer.from(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    "latin1"
  );

  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n%\xff\xff\xff\xff\n", "latin1")];
  const offsets = [0];

  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = Buffer.concat(chunks).length;
    chunks.push(Buffer.from(`${id} 0 obj\n`, "latin1"), objects[id], Buffer.from("\nendobj\n", "latin1"));
  }

  const xrefOffset = Buffer.concat(chunks).length;
  const xref = [
    "xref",
    `0 ${objects.length}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF"
  ].join("\n");

  chunks.push(Buffer.from(xref, "latin1"));
  return Buffer.concat(chunks);
}
