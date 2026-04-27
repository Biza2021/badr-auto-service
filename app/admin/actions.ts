"use server";

import bcrypt from "bcryptjs";
import {
  AppointmentStatus,
  InvoiceLineType,
  PaymentStatus,
  Prisma,
  RepairStatus,
  UserRole
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appointmentStatusLabels, paymentStatusLabels, repairStatusLabels } from "@/lib/status";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function optional(value: FormDataEntryValue | null) {
  const text = clean(value);
  return text.length ? text : null;
}

function optionalInt(value: FormDataEntryValue | null) {
  const text = clean(value);
  if (!text) return null;
  const parsed = Number.parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalMoney(value: FormDataEntryValue | null) {
  const text = clean(value).replace(",", ".");
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? new Prisma.Decimal(parsed) : null;
}

function optionalDate(value: FormDataEntryValue | null) {
  const text = clean(value);
  if (!text) return null;
  const date = new Date(`${text}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function requiredEnum<T extends Record<string, string>>(source: T, value: string, fallback: T[keyof T]) {
  return Object.values(source).includes(value) ? (value as T[keyof T]) : fallback;
}

async function createTrackingCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = `BAS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const exists = await prisma.repair.findUnique({ where: { trackingCode: code } });
    if (!exists) return code;
  }
  return `BAS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
}

async function writeActivity(message: string, entityType?: string, entityId?: string, repairId?: string) {
  const user = await requireAdmin();
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      message,
      entityType,
      entityId,
      repairId
    }
  });
}

async function writeActivityAs(
  userId: string,
  message: string,
  entityType?: string,
  entityId?: string,
  repairId?: string
) {
  await prisma.activityLog.create({
    data: {
      userId,
      message,
      entityType,
      entityId,
      repairId
    }
  });
}

async function requireTechnicianRepairAccess(repairId: string) {
  const user = await requireAuthenticatedUser();
  if (user.role === "ADMIN") return user;

  const repair = await prisma.repair.findUnique({
    where: { id: repairId },
    select: { technicianId: true }
  });

  if (!repair || repair.technicianId !== user.id) {
    redirect("/admin/technicien");
  }

  return user;
}

const technicianAllowedStatuses: RepairStatus[] = [
  RepairStatus.DIAGNOSTIC,
  RepairStatus.ATTENTE_ACCORD_CLIENT,
  RepairStatus.ATTENTE_PIECES,
  RepairStatus.EN_REPARATION,
  RepairStatus.CONTROLE_QUALITE,
  RepairStatus.PRET_A_RECUPERER
];

function requiredTechnicianStatus(value: string) {
  return technicianAllowedStatuses.includes(value as RepairStatus)
    ? (value as RepairStatus)
    : RepairStatus.EN_REPARATION;
}

async function optionalActiveTechnicianId(
  value: FormDataEntryValue | null,
  errorPath: string,
  existingTechnicianId?: string | null
) {
  const technicianId = optional(value);
  if (!technicianId) return null;

  const technician = await prisma.user.findFirst({
    where: {
      id: technicianId,
      role: UserRole.TECHNICIAN,
      ...(technicianId === existingTechnicianId ? {} : { isActive: true })
    },
    select: { id: true }
  });

  if (!technician) {
    redirect(`${errorPath}?erreur=${encodeURIComponent("Veuillez choisir un technicien actif.")}`);
  }

  return technician.id;
}

export async function createCustomerAction(formData: FormData) {
  await requireAdmin();
  const customer = await prisma.customer.create({
    data: {
      fullName: clean(formData.get("fullName")),
      phone: clean(formData.get("phone")),
      email: optional(formData.get("email")),
      notes: optional(formData.get("notes"))
    }
  });
  await writeActivity(`Client créé : ${customer.fullName}`, "Customer", customer.id);
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${customer.id}`);
}

export async function updateCustomerAction(customerId: string, formData: FormData) {
  await requireAdmin();
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      fullName: clean(formData.get("fullName")),
      phone: clean(formData.get("phone")),
      email: optional(formData.get("email")),
      notes: optional(formData.get("notes"))
    }
  });
  await writeActivity("Fiche client mise à jour", "Customer", customerId);
  revalidatePath(`/admin/clients/${customerId}`);
  redirect(`/admin/clients/${customerId}?succes=1`);
}

export async function addVehicleAction(customerId: string, formData: FormData) {
  await requireAdmin();
  await prisma.vehicle.create({
    data: {
      customerId,
      brand: clean(formData.get("brand")),
      model: clean(formData.get("model")),
      year: optionalInt(formData.get("year")),
      licensePlate: optional(formData.get("licensePlate")),
      mileage: optionalInt(formData.get("mileage"))
    }
  });
  await writeActivity("Véhicule ajouté à un client", "Customer", customerId);
  revalidatePath(`/admin/clients/${customerId}`);
  redirect(`/admin/clients/${customerId}?succes=vehicule`);
}

export async function createTechnicianAction(formData: FormData) {
  await requireAdmin();
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email")).toLowerCase();
  const password = clean(formData.get("password"));

  if (!name || !email || password.length < 6) {
    redirect(
      `/admin/techniciens?erreur=${encodeURIComponent(
        "Veuillez saisir un nom, un e-mail valide et un mot de passe d’au moins 6 caractères."
      )}`
    );
  }

  try {
    const technician = await prisma.user.create({
      data: {
        name,
        email,
        phone: optional(formData.get("phone")),
        role: UserRole.TECHNICIAN,
        isActive: true,
        passwordHash: await bcrypt.hash(password, 12)
      }
    });
    await writeActivity(`Technicien ajouté : ${technician.name}`, "User", technician.id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect(`/admin/techniciens?erreur=${encodeURIComponent("Cet e-mail est déjà utilisé.")}`);
    }
    throw error;
  }

  revalidatePath("/admin/techniciens");
  redirect("/admin/techniciens?succes=creation");
}

export async function updateTechnicianAction(technicianId: string, formData: FormData) {
  await requireAdmin();
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email")).toLowerCase();

  if (!name || !email) {
    redirect(`/admin/techniciens?erreur=${encodeURIComponent("Le nom et l’e-mail sont obligatoires.")}`);
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { id: technicianId, role: UserRole.TECHNICIAN },
      select: { id: true }
    });

    if (!existing) {
      redirect(`/admin/techniciens?erreur=${encodeURIComponent("Technicien introuvable.")}`);
    }

    const technician = await prisma.user.update({
      where: { id: technicianId },
      data: {
        name,
        email,
        phone: optional(formData.get("phone")),
        isActive: clean(formData.get("isActive")) === "on"
      }
    });
    await writeActivity(`Technicien modifié : ${technician.name}`, "User", technician.id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect(`/admin/techniciens?erreur=${encodeURIComponent("Cet e-mail est déjà utilisé.")}`);
    }
    throw error;
  }

  revalidatePath("/admin/techniciens");
  redirect("/admin/techniciens?succes=modification");
}

export async function toggleTechnicianActiveAction(technicianId: string) {
  await requireAdmin();
  const technician = await prisma.user.findFirst({
    where: { id: technicianId, role: UserRole.TECHNICIAN },
    select: { id: true, name: true, isActive: true }
  });

  if (!technician) {
    redirect(`/admin/techniciens?erreur=${encodeURIComponent("Technicien introuvable.")}`);
  }

  const updated = await prisma.user.update({
    where: { id: technician.id },
    data: { isActive: !technician.isActive }
  });

  await writeActivity(
    `${updated.isActive ? "Technicien activé" : "Technicien désactivé"} : ${updated.name}`,
    "User",
    updated.id
  );
  revalidatePath("/admin/techniciens");
  redirect("/admin/techniciens?succes=statut");
}

export async function resetTechnicianPasswordAction(technicianId: string, formData: FormData) {
  await requireAdmin();
  const password = clean(formData.get("password"));

  if (password.length < 6) {
    redirect(`/admin/techniciens?erreur=${encodeURIComponent("Le nouveau mot de passe doit contenir au moins 6 caractères.")}`);
  }

  const existing = await prisma.user.findFirst({
    where: { id: technicianId, role: UserRole.TECHNICIAN },
    select: { id: true }
  });

  if (!existing) {
    redirect(`/admin/techniciens?erreur=${encodeURIComponent("Technicien introuvable.")}`);
  }

  const technician = await prisma.user.update({
    where: { id: technicianId },
    data: {
      passwordHash: await bcrypt.hash(password, 12)
    }
  });

  await writeActivity(`Mot de passe technicien réinitialisé : ${technician.name}`, "User", technician.id);
  revalidatePath("/admin/techniciens");
  redirect("/admin/techniciens?succes=mot-de-passe");
}

export async function createRepairAction(formData: FormData) {
  await requireAdmin();
  const vehicleId = optional(formData.get("vehicleId"));
  const customerId = clean(formData.get("customerId"));
  const technicianId = await optionalActiveTechnicianId(formData.get("technicianId"), "/admin/reparations/new");
  const vehicle = vehicleId
    ? await prisma.vehicle.findUnique({ where: { id: vehicleId }, include: { customer: true } })
    : null;
  const resolvedCustomerId = vehicle?.customerId ?? customerId;

  if (!resolvedCustomerId) {
    redirect(`/admin/reparations/new?erreur=${encodeURIComponent("Veuillez choisir un client ou un véhicule.")}`);
  }

  const repair = await prisma.repair.create({
    data: {
      trackingCode: await createTrackingCode(),
      customerId: resolvedCustomerId,
      vehicleId,
      technicianId,
      issue: clean(formData.get("issue")),
      status: requiredEnum(RepairStatus, clean(formData.get("status")), RepairStatus.RECEPTION),
      estimatedPrice: optionalMoney(formData.get("estimatedPrice")),
      estimatedCompletion: optionalDate(formData.get("estimatedCompletion")),
      internalNotes: optional(formData.get("internalNotes")),
      customerNotes: optional(formData.get("customerNotes"))
    }
  });
  await writeActivity(`Réparation créée avec le code ${repair.trackingCode}`, "Repair", repair.id, repair.id);
  revalidatePath("/admin/reparations");
  redirect(`/admin/reparations/${repair.id}`);
}

export async function updateRepairAction(repairId: string, formData: FormData) {
  await requireAdmin();
  const status = requiredEnum(RepairStatus, clean(formData.get("status")), RepairStatus.RECEPTION);
  const currentRepair = await prisma.repair.findUnique({
    where: { id: repairId },
    select: { technicianId: true }
  });
  const technicianId = await optionalActiveTechnicianId(
    formData.get("technicianId"),
    `/admin/reparations/${repairId}`,
    currentRepair?.technicianId
  );
  await prisma.repair.update({
    where: { id: repairId },
    data: {
      technicianId,
      issue: clean(formData.get("issue")),
      status,
      estimatedPrice: optionalMoney(formData.get("estimatedPrice")),
      estimatedCompletion: optionalDate(formData.get("estimatedCompletion")),
      internalNotes: optional(formData.get("internalNotes")),
      customerNotes: optional(formData.get("customerNotes")),
      deliveredAt: status === RepairStatus.LIVRE ? new Date() : null
    }
  });
  await writeActivity(
    `Statut réparation mis à jour : ${repairStatusLabels[status]}`,
    "Repair",
    repairId,
    repairId
  );
  revalidatePath(`/admin/reparations/${repairId}`);
  redirect(`/admin/reparations/${repairId}?succes=1`);
}

export async function markRepairDeliveredAction(repairId: string) {
  await requireAdmin();
  await prisma.repair.update({
    where: { id: repairId },
    data: {
      status: RepairStatus.LIVRE,
      deliveredAt: new Date()
    }
  });
  await writeActivity("Véhicule marqué comme livré", "Repair", repairId, repairId);
  revalidatePath(`/admin/reparations/${repairId}`);
  redirect(`/admin/reparations/${repairId}?succes=livre`);
}

export async function createAdminAppointmentAction(formData: FormData) {
  await requireAdmin();
  const desiredDate = clean(formData.get("desiredDate"));
  const desiredTime = clean(formData.get("desiredTime")) || "09:00";
  await prisma.appointment.create({
    data: {
      fullName: clean(formData.get("fullName")),
      phone: clean(formData.get("phone")),
      vehicleText: clean(formData.get("vehicleText")),
      licensePlate: optional(formData.get("licensePlate")),
      desiredDateTime: new Date(`${desiredDate}T${desiredTime}:00`),
      serviceType: clean(formData.get("serviceType")),
      problemDescription: clean(formData.get("problemDescription")),
      notes: optional(formData.get("notes")),
      status: requiredEnum(AppointmentStatus, clean(formData.get("status")), AppointmentStatus.EN_ATTENTE)
    }
  });
  await writeActivity("Rendez-vous ajouté manuellement", "Appointment");
  revalidatePath("/admin/rendez-vous");
  redirect("/admin/rendez-vous?succes=1");
}

export async function updateAppointmentStatusAction(appointmentId: string, formData: FormData) {
  await requireAdmin();
  const status = requiredEnum(AppointmentStatus, clean(formData.get("status")), AppointmentStatus.EN_ATTENTE);
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status }
  });
  await writeActivity(
    `Statut rendez-vous mis à jour : ${appointmentStatusLabels[status]}`,
    "Appointment",
    appointmentId
  );
  revalidatePath("/admin/rendez-vous");
}

export async function createInvoiceAction(formData: FormData) {
  await requireAdmin();
  const repairId = clean(formData.get("repairId"));
  const repair = await prisma.repair.findUnique({
    where: { id: repairId },
    include: { customer: true, invoice: true }
  });

  if (!repair || repair.invoice) {
    redirect(
      `/admin/factures?erreur=${encodeURIComponent(
        "Cette réparation est introuvable ou déjà facturée."
      )}`
    );
  }

  const servicePrice = optionalMoney(formData.get("servicePrice"));
  const partPrice = optionalMoney(formData.get("partPrice"));
  const laborPrice = optionalMoney(formData.get("laborPrice"));
  const lines = [
    servicePrice
      ? {
          type: InvoiceLineType.SERVICE,
          description: clean(formData.get("serviceDescription")) || "Service atelier",
          quantity: 1,
          unitPrice: servicePrice
        }
      : null,
    partPrice
      ? {
          type: InvoiceLineType.PIECE,
          description: clean(formData.get("partDescription")) || "Pièces de rechange",
          quantity: optionalInt(formData.get("partQuantity")) ?? 1,
          unitPrice: partPrice
        }
      : null,
    laborPrice
      ? {
          type: InvoiceLineType.MAIN_OEUVRE,
          description: clean(formData.get("laborDescription")) || "Main-d’œuvre",
          quantity: 1,
          unitPrice: laborPrice
        }
      : null
  ].filter(Boolean) as Array<{
    type: InvoiceLineType;
    description: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
  }>;

  if (lines.length === 0) {
    redirect(`/admin/factures?erreur=${encodeURIComponent("Ajoutez au moins une ligne de facture.")}`);
  }

  const total = lines.reduce(
    (sum, line) => sum.plus(line.unitPrice.mul(line.quantity)),
    new Prisma.Decimal(0)
  );
  const count = await prisma.invoice.count();
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
      repairId: repair.id,
      customerId: repair.customerId,
      totalAmount: total,
      paidAmount: optionalMoney(formData.get("paidAmount")) ?? new Prisma.Decimal(0),
      status: requiredEnum(PaymentStatus, clean(formData.get("status")), PaymentStatus.NON_PAYE),
      lines: {
        create: lines
      }
    }
  });
  await writeActivity(`Facture ${invoice.invoiceNumber} créée`, "Invoice", invoice.id, repair.id);
  revalidatePath("/admin/factures");
  redirect(`/admin/factures/${invoice.id}`);
}

export async function updatePaymentStatusAction(invoiceId: string, formData: FormData) {
  await requireAdmin();
  const status = requiredEnum(PaymentStatus, clean(formData.get("status")), PaymentStatus.NON_PAYE);
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status,
      paidAmount: optionalMoney(formData.get("paidAmount")) ?? new Prisma.Decimal(0)
    }
  });
  await writeActivity(
    `Paiement facture mis à jour : ${paymentStatusLabels[status]}`,
    "Invoice",
    invoiceId
  );
  revalidatePath(`/admin/factures/${invoiceId}`);
  redirect(`/admin/factures/${invoiceId}?succes=1`);
}

export async function technicianStatusAction(repairId: string, formData: FormData) {
  const user = await requireTechnicianRepairAccess(repairId);
  const status = requiredTechnicianStatus(clean(formData.get("status")));
  await prisma.repair.update({
    where: { id: repairId },
    data: { status }
  });
  await writeActivityAs(
    user.id,
    `Technicien : statut mis à jour ${repairStatusLabels[status]}`,
    "Repair",
    repairId,
    repairId
  );
  revalidatePath("/admin/technicien");
}

export async function markReadyAction(repairId: string) {
  const user = await requireTechnicianRepairAccess(repairId);
  await prisma.repair.update({
    where: { id: repairId },
    data: { status: RepairStatus.PRET_A_RECUPERER }
  });
  await writeActivityAs(user.id, "Technicien : véhicule prêt à récupérer", "Repair", repairId, repairId);
  revalidatePath("/admin/technicien");
}

export async function updateGarageSettingsAction(formData: FormData) {
  await requireAdmin();
  await prisma.garageSettings.upsert({
    where: { singletonKey: "default" },
    create: {
      singletonKey: "default",
      garageName: clean(formData.get("garageName")) || "Badr Auto Service",
      phoneNumber: clean(formData.get("phoneNumber")),
      whatsappNumber: clean(formData.get("whatsappNumber")),
      address: clean(formData.get("address")),
      openingHours: clean(formData.get("openingHours")),
      defaultLanguage: "fr"
    },
    update: {
      garageName: clean(formData.get("garageName")) || "Badr Auto Service",
      phoneNumber: clean(formData.get("phoneNumber")),
      whatsappNumber: clean(formData.get("whatsappNumber")),
      address: clean(formData.get("address")),
      openingHours: clean(formData.get("openingHours")),
      defaultLanguage: "fr"
    }
  });
  await writeActivity("Paramètres du garage mis à jour", "GarageSettings");
  revalidatePath("/admin/parametres");
  redirect("/admin/parametres?succes=1");
}
