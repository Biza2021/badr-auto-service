import { prisma } from "@/lib/prisma";

export type GarageSettingsView = {
  garageName: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  openingHours: string;
  defaultLanguage: string;
};

export const fallbackGarageSettings: GarageSettingsView = {
  garageName: "Badr Auto Service",
  phoneNumber: "+212 5 22 48 19 70",
  whatsappNumber: "+212 6 61 24 87 30",
  address: "Salé Jadida",
  openingHours: "Lundi - samedi, 08:30 - 18:30",
  defaultLanguage: "fr"
};

export async function getGarageSettings(): Promise<GarageSettingsView> {
  const settings = await prisma.garageSettings.findUnique({
    where: { singletonKey: "default" },
    select: {
      garageName: true,
      phoneNumber: true,
      whatsappNumber: true,
      address: true,
      openingHours: true,
      defaultLanguage: true
    }
  });

  return settings ?? fallbackGarageSettings;
}
