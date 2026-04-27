import type { Metadata } from "next";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { ImagePanel } from "@/components/image-panel";
import { PendingButton } from "@/components/pending-button";
import { PublicShell } from "@/components/public-header";
import { SectionHeading } from "@/components/section-heading";
import { createPublicAppointment } from "./actions";

export const metadata: Metadata = {
  title: "Prendre rendez-vous"
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const services = [
  "Vidange",
  "Diagnostic moteur",
  "Freinage",
  "Batterie",
  "Pneus",
  "Climatisation",
  "Suspension",
  "Entretien général",
  "Inspection avant achat"
];

export default async function AppointmentPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const success = params.succes === "1";
  const error = typeof params.erreur === "string" ? params.erreur : null;

  return (
    <PublicShell>
      <main className="bg-mist">
        <section className="bg-white py-12 sm:py-14">
          <div className="container-page grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Rendez-vous"
                title="Demander un créneau au garage"
                text="Remplissez les informations principales. L’équipe vous contacte pour confirmer le créneau selon la charge de l’atelier."
              />
              {success ? (
                <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                  <CheckCircle2 className="mr-2 inline h-5 w-5" aria-hidden="true" />
                  Votre demande a bien été envoyée. Le garage vous contactera pour confirmation.
                </div>
              ) : null}
              {error ? (
                <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
                  {error}
                </div>
              ) : null}
            </div>
            <ImagePanel
              src="/images/customer/04-online-appointment-booking-badr-auto-service.png"
              alt="Formulaire de rendez-vous Badr Auto Service"
              className="min-h-[260px] sm:min-h-[330px]"
              priority
            />
          </div>
        </section>

        <section className="py-12 sm:py-14">
          <div className="container-page">
            <form action={createPublicAppointment} className="surface grid gap-6 p-5 sm:p-7 lg:grid-cols-2">
              <label className="block">
                <span className="field-label">Nom complet</span>
                <input className="field-input" name="fullName" required />
              </label>
              <label className="block">
                <span className="field-label">Numéro de téléphone</span>
                <input className="field-input" name="phone" required type="tel" />
              </label>
              <label className="block">
                <span className="field-label">Marque et modèle du véhicule</span>
                <input className="field-input" name="vehicleText" placeholder="Ex. Dacia Logan" required />
              </label>
              <label className="block">
                <span className="field-label">Matricule, si disponible</span>
                <input className="field-input" name="licensePlate" placeholder="Ex. 12345-A-6" />
              </label>
              <label className="block">
                <span className="field-label">Date souhaitée</span>
                <input className="field-input" name="desiredDate" required type="date" />
              </label>
              <label className="block">
                <span className="field-label">Heure souhaitée</span>
                <input className="field-input" name="desiredTime" required type="time" />
              </label>
              <label className="block">
                <span className="field-label">Type de service</span>
                <select className="field-input" name="serviceType" required>
                  <option value="">Choisir un service</option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block lg:row-span-2">
                <span className="field-label">Description du problème</span>
                <textarea className="field-input min-h-32" name="problemDescription" required />
              </label>
              <label className="block lg:col-span-2">
                <span className="field-label">Notes complémentaires</span>
                <textarea className="field-input min-h-24" name="notes" />
              </label>
              <div className="flex flex-col gap-4 lg:col-span-2 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm text-slate-600">
                  Les informations servent uniquement à organiser votre passage au garage.
                </p>
                <PendingButton pendingLabel="Envoi en cours...">
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  Envoyer la demande
                </PendingButton>
              </div>
            </form>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
