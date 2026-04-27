import Link from "next/link";
import { CheckCircle2, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { PendingButton } from "@/components/pending-button";
import { StatusBadge } from "@/components/status-badge";
import { addVehicleAction, updateCustomerAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { repairStatusLabels } from "@/lib/status";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CustomerDetailPage({
  params,
  searchParams
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const success = query.succes;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      vehicles: { orderBy: { createdAt: "desc" } },
      repairs: {
        orderBy: { updatedAt: "desc" },
        include: { vehicle: true }
      }
    }
  });

  if (!customer) notFound();

  return (
    <>
      <AdminPageHeader
        eyebrow="Fiche client"
        title={customer.fullName}
        text="Coordonnées, notes, véhicules et historique atelier."
        action={
          <Link className="btn-primary" href="/admin/reparations/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouvelle réparation
          </Link>
        }
      />
      {success ? (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="mr-2 inline h-5 w-5" aria-hidden="true" />
          Fiche mise à jour.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="surface p-5">
          <h2 className="font-bold text-navy">Informations client</h2>
          <form action={updateCustomerAction.bind(null, customer.id)} className="mt-5 grid gap-4">
            <label>
              <span className="field-label">Nom complet</span>
              <input className="field-input" name="fullName" required defaultValue={customer.fullName} />
            </label>
            <label>
              <span className="field-label">Téléphone</span>
              <input className="field-input" name="phone" required type="tel" defaultValue={customer.phone} />
            </label>
            <label>
              <span className="field-label">E-mail</span>
              <input className="field-input" name="email" type="email" defaultValue={customer.email ?? ""} />
            </label>
            <label>
              <span className="field-label">Notes</span>
              <textarea className="field-input min-h-28" name="notes" defaultValue={customer.notes ?? ""} />
            </label>
            <PendingButton>Enregistrer</PendingButton>
          </form>
        </section>

        <div className="space-y-6">
          <section className="surface p-5">
            <h2 className="font-bold text-navy">Véhicules</h2>
            {customer.vehicles.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="Aucun véhicule" text="Ajoutez un véhicule pour compléter la fiche client." />
              </div>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {customer.vehicles.map((vehicle) => (
                  <div className="rounded-lg border border-slate-200 bg-white p-4" key={vehicle.id}>
                    <p className="font-bold text-navy">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {vehicle.year ?? "Année non renseignée"} · {vehicle.licensePlate ?? "Matricule non renseigné"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {vehicle.mileage ? `${vehicle.mileage.toLocaleString("fr-MA")} km` : "Kilométrage non renseigné"}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <form action={addVehicleAction.bind(null, customer.id)} className="mt-6 grid gap-4 md:grid-cols-2">
              <label>
                <span className="field-label">Marque</span>
                <input className="field-input" name="brand" required />
              </label>
              <label>
                <span className="field-label">Modèle</span>
                <input className="field-input" name="model" required />
              </label>
              <label>
                <span className="field-label">Année</span>
                <input className="field-input" name="year" type="number" />
              </label>
              <label>
                <span className="field-label">Matricule</span>
                <input className="field-input" name="licensePlate" />
              </label>
              <label>
                <span className="field-label">Kilométrage</span>
                <input className="field-input" name="mileage" type="number" />
              </label>
              <div className="flex items-end">
                <PendingButton>Ajouter le véhicule</PendingButton>
              </div>
            </form>
          </section>

          <section className="surface overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-navy">Historique des réparations</h2>
            </div>
            {customer.repairs.length === 0 ? (
              <div className="p-5">
                <EmptyState title="Aucune réparation" text="L’historique apparaîtra dès le premier dossier." />
              </div>
            ) : (
              <div className="overflow-x-auto sm:overflow-visible">
                <table className="mobile-card-table min-w-[720px] sm:min-w-0">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Code</th>
                      <th className="px-5 py-3">Véhicule</th>
                      <th className="px-5 py-3">Statut</th>
                      <th className="px-5 py-3">Prix estimé</th>
                      <th className="px-5 py-3">Créé le</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customer.repairs.map((repair) => (
                      <tr key={repair.id}>
                        <td data-label="Code" className="px-5 py-4 font-bold text-navy">{repair.trackingCode}</td>
                        <td data-label="Véhicule" className="px-5 py-4">
                          {repair.vehicle ? `${repair.vehicle.brand} ${repair.vehicle.model}` : "Non renseigné"}
                        </td>
                        <td data-label="Statut" className="px-5 py-4">
                          <StatusBadge label={repairStatusLabels[repair.status]} status={repair.status} />
                        </td>
                        <td data-label="Prix estimé" className="px-5 py-4">{formatMoney(repair.estimatedPrice)}</td>
                        <td data-label="Créé le" className="px-5 py-4">{formatDate(repair.createdAt)}</td>
                        <td data-label="Action" className="px-5 py-4">
                          <Link className="font-semibold text-accent" href={`/admin/reparations/${repair.id}`}>
                            Ouvrir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
