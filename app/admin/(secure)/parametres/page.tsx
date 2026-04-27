import { CheckCircle2, Settings } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { PendingButton } from "@/components/pending-button";
import { updateGarageSettingsAction } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const success = params.succes;
  const settings =
    (await prisma.garageSettings.findUnique({ where: { singletonKey: "default" } })) ??
    ({
      garageName: "Badr Auto Service",
      phoneNumber: "+212 5 22 48 19 70",
      whatsappNumber: "+212 6 61 24 87 30",
      address: "Angle rue Al Massira et rue Ibn Tachfine, Casablanca",
      openingHours: "Lundi - samedi, 08:30 - 18:30",
      defaultLanguage: "fr"
    } as const);

  return (
    <>
      <AdminPageHeader
        eyebrow="Paramètres"
        title="Configuration du garage"
        text="Ces informations servent de référence pour l’équipe et les communications du garage."
      />
      {success ? (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="mr-2 inline h-5 w-5" aria-hidden="true" />
          Paramètres enregistrés.
        </div>
      ) : null}
      <section className="surface max-w-3xl p-5">
        <div className="mb-5 flex items-center gap-3">
          <Settings className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="font-bold text-navy">Informations générales</h2>
        </div>
        <form action={updateGarageSettingsAction} className="grid gap-5">
          <label>
            <span className="field-label">Nom du garage</span>
            <input className="field-input" name="garageName" required defaultValue={settings.garageName} />
          </label>
          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="field-label">Téléphone</span>
              <input className="field-input" name="phoneNumber" required defaultValue={settings.phoneNumber} />
            </label>
            <label>
              <span className="field-label">Numéro WhatsApp</span>
              <input className="field-input" name="whatsappNumber" required defaultValue={settings.whatsappNumber} />
            </label>
          </div>
          <label>
            <span className="field-label">Adresse</span>
            <textarea className="field-input min-h-24" name="address" required defaultValue={settings.address} />
          </label>
          <label>
            <span className="field-label">Horaires d’ouverture</span>
            <input className="field-input" name="openingHours" required defaultValue={settings.openingHours} />
          </label>
          <label>
            <span className="field-label">Langue par défaut</span>
            <select className="field-input" name="defaultLanguage" defaultValue="fr" disabled>
              <option value="fr">Français</option>
            </select>
            <span className="mt-2 block text-xs font-medium text-slate-500">
              L’application est configurée en français pour l’ensemble des écrans.
            </span>
          </label>
          <PendingButton>Enregistrer les paramètres</PendingButton>
        </form>
      </section>
    </>
  );
}
