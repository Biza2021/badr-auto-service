import {
  AppointmentStatus,
  InvoiceLineType,
  PaymentStatus,
  RepairStatus
} from "@prisma/client";

export const repairStatusLabels: Record<RepairStatus, string> = {
  RECEPTION: "Réception",
  DIAGNOSTIC: "Diagnostic",
  ATTENTE_ACCORD_CLIENT: "En attente d’accord client",
  ATTENTE_PIECES: "En attente de pièces",
  EN_REPARATION: "En réparation",
  CONTROLE_QUALITE: "Contrôle qualité",
  PRET_A_RECUPERER: "Prêt à récupérer",
  LIVRE: "Livré",
  ANNULE: "Annulé"
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  EN_ATTENTE: "En attente",
  CONFIRME: "Confirmé",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  ANNULE: "Annulé"
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  NON_PAYE: "Non payé",
  PARTIELLEMENT_PAYE: "Partiellement payé",
  PAYE: "Payé"
};

export const invoiceLineTypeLabels: Record<InvoiceLineType, string> = {
  SERVICE: "Service",
  PIECE: "Pièce",
  MAIN_OEUVRE: "Main-d’œuvre"
};

export const repairTimeline: RepairStatus[] = [
  "RECEPTION",
  "DIAGNOSTIC",
  "ATTENTE_ACCORD_CLIENT",
  "ATTENTE_PIECES",
  "EN_REPARATION",
  "CONTROLE_QUALITE",
  "PRET_A_RECUPERER",
  "LIVRE"
];

export function statusBadgeClass(status: string) {
  if (["PRET_A_RECUPERER", "PAYE", "TERMINE", "LIVRE"].includes(status)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (["ANNULE", "NON_PAYE"].includes(status)) {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }

  if (["ATTENTE_ACCORD_CLIENT", "ATTENTE_PIECES", "EN_ATTENTE", "PARTIELLEMENT_PAYE"].includes(status)) {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  return "bg-sky-50 text-sky-700 ring-sky-200";
}
