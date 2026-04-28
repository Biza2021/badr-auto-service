import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import {
  AppointmentStatus,
  InvoiceLineType,
  PaymentStatus,
  Prisma,
  PrismaClient,
  RepairStatus,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

function addDays(days: number, hour = 9, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function money(value: number) {
  return new Prisma.Decimal(value);
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@badrautoservice.ma";
  const generatedPassword = `${randomBytes(10).toString("base64url")}Aa1!`;
  const demoPassword = process.env.SEED_DEMO_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? generatedPassword;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? demoPassword;
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const technicianPasswordHash = await bcrypt.hash(demoPassword, 12);

  await prisma.$transaction([
    prisma.invoiceLine.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.repair.deleteMany(),
    prisma.vehicle.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.garageSettings.deleteMany(),
    prisma.user.deleteMany()
  ]);

  const admin = await prisma.user.create({
    data: {
      email,
      name: "Badr",
      phone: "+212 6 61 24 87 30",
      role: UserRole.ADMIN,
      isActive: true,
      passwordHash
    }
  });

  const [yassineTechnician, mehdiTechnician] = await Promise.all([
    prisma.user.create({
      data: {
        email: "yassine.benali@badrautoservice.ma",
        name: "Yassine Benali",
        phone: "+212 6 70 12 98 44",
        role: UserRole.TECHNICIAN,
        isActive: true,
        passwordHash: technicianPasswordHash
      }
    }),
    prisma.user.create({
      data: {
        email: "mehdi.elidrissi@badrautoservice.ma",
        name: "Mehdi El Idrissi",
        phone: "+212 6 62 35 41 90",
        role: UserRole.TECHNICIAN,
        isActive: true,
        passwordHash: technicianPasswordHash
      }
    })
  ]);

  await prisma.garageSettings.create({
    data: {
      phoneNumber: "+212 5 22 48 19 70",
      whatsappNumber: "+212 6 61 24 87 30",
      address: "Salé Jadida",
      openingHours: "Lundi - samedi, 08:30 - 18:30",
      defaultLanguage: "fr"
    }
  });

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        fullName: "Ahmed Benjelloun",
        phone: "+212 6 11 45 28 90",
        email: "ahmed.benjelloun@example.ma",
        notes: "Préfère être contacté par WhatsApp.",
        vehicles: {
          create: [
            {
              brand: "Dacia",
              model: "Logan",
              year: 2018,
              licensePlate: "12345-A-6",
              mileage: 128000
            }
          ]
        }
      },
      include: { vehicles: true }
    }),
    prisma.customer.create({
      data: {
        fullName: "Fatima Zahra El Idrissi",
        phone: "+212 6 72 31 55 04",
        notes: "Cliente régulière pour entretien général.",
        vehicles: {
          create: [
            {
              brand: "Renault",
              model: "Clio 4",
              year: 2017,
              licensePlate: "88421-B-1",
              mileage: 97000
            }
          ]
        }
      },
      include: { vehicles: true }
    }),
    prisma.customer.create({
      data: {
        fullName: "Mehdi Alaoui",
        phone: "+212 6 58 90 44 12",
        email: "mehdi.alaoui@example.ma",
        vehicles: {
          create: [
            {
              brand: "Peugeot",
              model: "208",
              year: 2020,
              licensePlate: "44120-D-5",
              mileage: 62000
            }
          ]
        }
      },
      include: { vehicles: true }
    }),
    prisma.customer.create({
      data: {
        fullName: "Sara Rachidi",
        phone: "+212 6 19 77 23 80",
        notes: "Demande souvent un devis avant intervention.",
        vehicles: {
          create: [
            {
              brand: "Hyundai",
              model: "i10",
              year: 2019,
              licensePlate: "73012-W-8",
              mileage: 74000
            }
          ]
        }
      },
      include: { vehicles: true }
    }),
    prisma.customer.create({
      data: {
        fullName: "Omar Tazi",
        phone: "+212 6 45 83 20 18",
        vehicles: {
          create: [
            {
              brand: "Toyota",
              model: "Yaris",
              year: 2016,
              licensePlate: "52009-H-2",
              mileage: 151000
            }
          ]
        }
      },
      include: { vehicles: true }
    })
  ]);

  const [ahmed, fatima, mehdi, sara, omar] = customers;

  const repair1 = await prisma.repair.create({
    data: {
      trackingCode: "BAS-2026-1842",
      customerId: ahmed.id,
      vehicleId: ahmed.vehicles[0].id,
      technicianId: yassineTechnician.id,
      issue: "Bruit au freinage et vibration légère au volant.",
      status: RepairStatus.EN_REPARATION,
      estimatedPrice: money(1450),
      estimatedCompletion: addDays(1, 16, 0),
      internalNotes: "Vérifier plaquettes avant, disques et équilibrage.",
      customerNotes: "Photos et observations partagées avant remplacement."
    }
  });

  const repair2 = await prisma.repair.create({
    data: {
      trackingCode: "BAS-2026-2397",
      customerId: fatima.id,
      vehicleId: fatima.vehicles[0].id,
      technicianId: mehdiTechnician.id,
      issue: "Entretien périodique avec vidange et filtres.",
      status: RepairStatus.PRET_A_RECUPERER,
      estimatedPrice: money(720),
      estimatedCompletion: addDays(0, 17, 30),
      internalNotes: "Contrôle final effectué, véhicule lavé rapidement."
    }
  });

  const repair3 = await prisma.repair.create({
    data: {
      trackingCode: "BAS-2026-3150",
      customerId: mehdi.id,
      vehicleId: mehdi.vehicles[0].id,
      technicianId: yassineTechnician.id,
      issue: "Voyant moteur allumé, perte de puissance en montée.",
      status: RepairStatus.DIAGNOSTIC,
      estimatedCompletion: addDays(2, 12, 0),
      internalNotes: "Lecture valise prévue, contrôler admission et capteurs."
    }
  });

  const repair4 = await prisma.repair.create({
    data: {
      trackingCode: "BAS-2026-4026",
      customerId: sara.id,
      vehicleId: sara.vehicles[0].id,
      technicianId: mehdiTechnician.id,
      issue: "Climatisation faible avant l’été.",
      status: RepairStatus.ATTENTE_ACCORD_CLIENT,
      estimatedPrice: money(980),
      estimatedCompletion: addDays(3, 15, 0),
      internalNotes: "Devis recharge et recherche de petite fuite envoyé."
    }
  });

  await prisma.appointment.createMany({
    data: [
      {
        fullName: "Nabil El Fassi",
        phone: "+212 6 64 18 22 73",
        vehicleText: "Volkswagen Golf 6",
        licensePlate: "66144-J-7",
        desiredDateTime: addDays(1, 10, 30),
        serviceType: "Diagnostic moteur",
        problemDescription: "Voyant moteur orange depuis deux jours.",
        notes: "Disponible le matin.",
        status: AppointmentStatus.EN_ATTENTE
      },
      {
        customerId: omar.id,
        vehicleId: omar.vehicles[0].id,
        fullName: omar.fullName,
        phone: omar.phone,
        vehicleText: "Toyota Yaris",
        licensePlate: "52009-H-2",
        desiredDateTime: addDays(0, 14, 0),
        serviceType: "Batterie",
        problemDescription: "Démarrage difficile le matin.",
        status: AppointmentStatus.CONFIRME
      },
      {
        fullName: "Imane Berrada",
        phone: "+212 6 90 17 44 62",
        vehicleText: "Citroen C-Elysee",
        desiredDateTime: addDays(2, 11, 15),
        serviceType: "Inspection avant achat",
        problemDescription: "Contrôle complet avant décision d’achat.",
        status: AppointmentStatus.CONFIRME
      }
    ]
  });

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: "FAC-2026-0001",
      repairId: repair2.id,
      customerId: fatima.id,
      status: PaymentStatus.PAYE,
      totalAmount: money(720),
      paidAmount: money(720),
      lines: {
        create: [
          {
            type: InvoiceLineType.SERVICE,
            description: "Vidange huile moteur 5W30",
            quantity: 1,
            unitPrice: money(420)
          },
          {
            type: InvoiceLineType.PIECE,
            description: "Filtre à huile et filtre à air",
            quantity: 1,
            unitPrice: money(210)
          },
          {
            type: InvoiceLineType.MAIN_OEUVRE,
            description: "Main-d’œuvre entretien général",
            quantity: 1,
            unitPrice: money(90)
          }
        ]
      }
    }
  });

  await prisma.activityLog.createMany({
    data: [
      {
        userId: admin.id,
        repairId: repair1.id,
        message: "Statut mis à jour : En réparation",
        entityType: "Repair",
        entityId: repair1.id
      },
      {
        userId: yassineTechnician.id,
        repairId: repair3.id,
        message: "Diagnostic moteur ajouté au planning",
        entityType: "Repair",
        entityId: repair3.id
      },
      {
        userId: admin.id,
        repairId: repair2.id,
        message: `Facture ${invoice.invoiceNumber} marquée comme payée`,
        entityType: "Invoice",
        entityId: invoice.id
      },
      {
        userId: admin.id,
        repairId: repair4.id,
        message: "Devis envoyé au client pour accord",
        entityType: "Repair",
        entityId: repair4.id
      }
    ]
  });

  console.log("Seed terminé pour Badr Auto Service.");
  console.log(`Compte admin : ${email}`);
  console.log("Comptes techniciens : yassine.benali@badrautoservice.ma, mehdi.elidrissi@badrautoservice.ma");
  if (!process.env.SEED_ADMIN_PASSWORD && !process.env.SEED_DEMO_PASSWORD) {
    console.log(`Mot de passe généré pour la démo : ${generatedPassword}`);
  } else {
    console.log("Mot de passe démo : variable SEED_DEMO_PASSWORD ou SEED_ADMIN_PASSWORD.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
