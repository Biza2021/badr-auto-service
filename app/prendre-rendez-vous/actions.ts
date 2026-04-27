"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const appointmentSchema = z.object({
  fullName: z.string().min(2, "Veuillez indiquer votre nom complet."),
  phone: z.string().min(8, "Veuillez indiquer un numéro de téléphone valide."),
  vehicleText: z.string().min(2, "Veuillez indiquer la marque et le modèle du véhicule."),
  licensePlate: z.string().optional(),
  desiredDate: z.string().min(1, "Veuillez choisir une date."),
  desiredTime: z.string().min(1, "Veuillez choisir une heure."),
  serviceType: z.string().min(1, "Veuillez choisir un service."),
  problemDescription: z.string().min(8, "Veuillez décrire brièvement le problème."),
  notes: z.string().optional()
});

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function createPublicAppointment(formData: FormData) {
  const parsed = appointmentSchema.safeParse({
    fullName: clean(formData.get("fullName")),
    phone: clean(formData.get("phone")),
    vehicleText: clean(formData.get("vehicleText")),
    licensePlate: clean(formData.get("licensePlate")),
    desiredDate: clean(formData.get("desiredDate")),
    desiredTime: clean(formData.get("desiredTime")),
    serviceType: clean(formData.get("serviceType")),
    problemDescription: clean(formData.get("problemDescription")),
    notes: clean(formData.get("notes"))
  });

  if (!parsed.success) {
    const message = encodeURIComponent(parsed.error.issues[0]?.message ?? "Veuillez vérifier le formulaire.");
    redirect(`/prendre-rendez-vous?erreur=${message}`);
  }

  const data = parsed.data;
  const desiredDateTime = new Date(`${data.desiredDate}T${data.desiredTime}:00`);

  if (Number.isNaN(desiredDateTime.getTime())) {
    redirect("/prendre-rendez-vous?erreur=Date%20ou%20heure%20invalide.");
  }

  const existingCustomer = await prisma.customer.findFirst({
    where: { phone: data.phone }
  });

  const customer =
    existingCustomer ??
    (await prisma.customer.create({
      data: {
        fullName: data.fullName,
        phone: data.phone
      }
    }));

  await prisma.appointment.create({
    data: {
      customerId: customer.id,
      fullName: data.fullName,
      phone: data.phone,
      vehicleText: data.vehicleText,
      licensePlate: data.licensePlate || null,
      desiredDateTime,
      serviceType: data.serviceType,
      problemDescription: data.problemDescription,
      notes: data.notes || null
    }
  });

  await prisma.activityLog.create({
    data: {
      message: `Nouveau rendez-vous demandé par ${data.fullName}`,
      entityType: "Appointment"
    }
  });

  redirect("/prendre-rendez-vous?succes=1");
}
