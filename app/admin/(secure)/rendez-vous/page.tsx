import Image from "next/image";
import { CalendarPlus, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { PendingButton } from "@/components/pending-button";
import { StatusBadge } from "@/components/status-badge";
import { createAdminAppointmentAction, updateAppointmentStatusAction } from "@/app/admin/actions";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { appointmentStatusLabels } from "@/lib/status";

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

export default async function AppointmentsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = typeof params.statut === "string" ? params.statut : "";
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const success = params.succes;

  const appointments = await prisma.appointment.findMany({
    where: {
      AND: [
        status ? { status: status as never } : {},
        q
          ? {
              OR: [
                { fullName: { contains: q, mode: "insensitive" } },
                { phone: { contains: q, mode: "insensitive" } },
                { vehicleText: { contains: q, mode: "insensitive" } },
                { serviceType: { contains: q, mode: "insensitive" } }
              ]
            }
          : {}
      ]
    },
    orderBy: { desiredDateTime: "asc" }
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Rendez-vous"
        title="Planning atelier"
        text="Confirmez les demandes clients, annulez les créneaux impossibles et marquez les passages terminés."
      />
      {success ? (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Rendez-vous enregistré.
        </div>
      ) : null}

      <section className="surface mb-6 overflow-hidden">
        <div className="relative h-48 bg-slate-200">
          <Image
            src="/images/admin/14-appointment-calendar-admin-ui-badr-auto-service.png"
            alt="Calendrier rendez-vous Badr Auto Service"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <form className="grid gap-3 border-t border-slate-200 p-4 md:grid-cols-[1fr_240px_auto]">
          <label>
            <span className="field-label">Recherche</span>
            <input className="field-input" defaultValue={q} name="q" placeholder="Client, téléphone ou service" />
          </label>
          <label>
            <span className="field-label">Statut</span>
            <select className="field-input" defaultValue={status} name="statut">
              <option value="">Tous les statuts</option>
              {Object.entries(appointmentStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button className="btn-dark w-full" type="submit">
              <Search className="h-4 w-4" aria-hidden="true" />
              Filtrer
            </button>
          </div>
        </form>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="surface overflow-hidden">
          {appointments.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Aucun rendez-vous" text="Les demandes en ligne et les ajouts manuels apparaîtront ici." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Véhicule</th>
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3">Changer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-5 py-4 font-semibold text-navy">
                        {formatDateTime(appointment.desiredDateTime)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold">{appointment.fullName}</p>
                        <p className="text-xs text-slate-500">{appointment.phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p>{appointment.vehicleText}</p>
                        <p className="text-xs text-slate-500">{appointment.licensePlate ?? "Matricule non renseigné"}</p>
                      </td>
                      <td className="px-5 py-4">{appointment.serviceType}</td>
                      <td className="px-5 py-4">
                        <StatusBadge label={appointmentStatusLabels[appointment.status]} status={appointment.status} />
                      </td>
                      <td className="px-5 py-4">
                        <form action={updateAppointmentStatusAction.bind(null, appointment.id)} className="flex gap-2">
                          <select className="field-input mt-0 min-w-40" name="status" defaultValue={appointment.status}>
                            {Object.entries(appointmentStatusLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <button className="btn-secondary py-2" type="submit">
                            Valider
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="surface p-5">
          <div className="flex items-center gap-3">
            <CalendarPlus className="h-5 w-5 text-accent" aria-hidden="true" />
            <h2 className="font-bold text-navy">Ajouter un rendez-vous</h2>
          </div>
          <form action={createAdminAppointmentAction} className="mt-5 grid gap-4">
            <label>
              <span className="field-label">Nom complet</span>
              <input className="field-input" name="fullName" required />
            </label>
            <label>
              <span className="field-label">Téléphone</span>
              <input className="field-input" name="phone" required type="tel" />
            </label>
            <label>
              <span className="field-label">Véhicule</span>
              <input className="field-input" name="vehicleText" required />
            </label>
            <label>
              <span className="field-label">Matricule</span>
              <input className="field-input" name="licensePlate" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="field-label">Date</span>
                <input className="field-input" name="desiredDate" required type="date" />
              </label>
              <label>
                <span className="field-label">Heure</span>
                <input className="field-input" name="desiredTime" required type="time" />
              </label>
            </div>
            <label>
              <span className="field-label">Service</span>
              <select className="field-input" name="serviceType" required>
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Statut</span>
              <select className="field-input" name="status" defaultValue="CONFIRME">
                {Object.entries(appointmentStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Description</span>
              <textarea className="field-input min-h-24" name="problemDescription" required />
            </label>
            <label>
              <span className="field-label">Notes</span>
              <textarea className="field-input min-h-20" name="notes" />
            </label>
            <PendingButton>Enregistrer</PendingButton>
          </form>
        </section>
      </div>
    </>
  );
}
