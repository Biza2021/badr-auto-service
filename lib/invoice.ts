import { paymentStatusLabels } from "@/lib/status";

export type InvoiceDocumentData = {
  invoiceNumber: string;
  createdAt: Date | string;
  totalAmount: { toString(): string } | number | string;
  paidAmount: { toString(): string } | number | string;
  status: keyof typeof paymentStatusLabels;
  customer: {
    fullName: string;
    phone: string | null;
  };
  repair: {
    trackingCode: string;
    vehicle: {
      brand: string;
      model: string;
      licensePlate?: string | null;
    } | null;
  };
  lines: Array<{
    type: string;
    description: string;
    quantity: number;
    unitPrice: { toString(): string } | number | string;
  }>;
};

export function amountNumber(value: { toString(): string } | number | string | null | undefined) {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value.toString());
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMad(value: { toString(): string } | number | string | null | undefined) {
  return `${new Intl.NumberFormat("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amountNumber(value))} MAD`;
}

export function invoiceLineTotal(line: { quantity: number; unitPrice: { toString(): string } | number | string }) {
  return amountNumber(line.unitPrice) * line.quantity;
}

export function invoiceRemainingBalance(invoice: Pick<InvoiceDocumentData, "totalAmount" | "paidAmount">) {
  return amountNumber(invoice.totalAmount) - amountNumber(invoice.paidAmount);
}

export function invoiceVehicleLabel(invoice: Pick<InvoiceDocumentData, "repair">) {
  return invoice.repair.vehicle
    ? `${invoice.repair.vehicle.brand} ${invoice.repair.vehicle.model}`
    : "Non renseigné";
}

export function invoiceFileName(invoiceNumber: string) {
  return `facture-${invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "-")}.pdf`;
}

export function normalizeMoroccanWhatsAppPhone(phone: string | null | undefined) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;

  let normalized = digits;
  if (normalized.startsWith("00")) normalized = normalized.slice(2);
  if (normalized.startsWith("212")) return normalized;
  if (normalized.startsWith("0") && normalized.length >= 9) return `212${normalized.slice(1)}`;
  if (/^[67]/.test(normalized)) return `212${normalized}`;
  return normalized.length >= 8 ? normalized : null;
}

export function buildInvoiceWhatsAppMessage(invoice: InvoiceDocumentData, garageName = "Badr Auto Service") {
  const vehicle = invoiceVehicleLabel(invoice);
  const status = paymentStatusLabels[invoice.status];

  return [
    `Bonjour ${invoice.customer.fullName},`,
    "",
    `Votre facture ${invoice.invoiceNumber} de ${garageName} est prête.`,
    `Véhicule : ${vehicle}`,
    `Montant total : ${formatMad(invoice.totalAmount)}`,
    `Statut du paiement : ${status}`,
    `Référence réparation : ${invoice.repair.trackingCode}`,
    "",
    "Merci pour votre confiance."
  ].join("\n");
}

export function buildInvoiceWhatsAppUrl(invoice: InvoiceDocumentData, garageName?: string) {
  const phone = normalizeMoroccanWhatsAppPhone(invoice.customer.phone);
  if (!phone) return null;

  // Ce lien ouvre WhatsApp avec un message prérempli. Il n’attache pas automatiquement le PDF.
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildInvoiceWhatsAppMessage(invoice, garageName))}`;
}
