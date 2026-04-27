import { AdminPageHeader } from "@/components/admin-page-header";
import { PendingButton } from "@/components/pending-button";
import { prisma } from "@/lib/prisma";
import { repairStatusLabels } from "@/lib/status";
import { createRepairAction } from "@/app/admin/actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NewRepairPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const error = typeof params.erreur === "string" ? params.erreur : null;
  const [customers, vehicles, technicians] = await Promise.all([
    prisma.customer.findMany({ orderBy: { fullName: "asc" } }),
    prisma.vehicle.findMany({ include: { customer: true }, orderBy: [{ brand: "asc" }, { model: "asc" }] }),
    prisma.user.findMany({ where: { role: "TECHNICIAN" }, orderBy: { name: "asc" } })
  ]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Nouvelle réparation"
        title="Créer un dossier atelier"
        text="Un code de suivi unique sera généré automatiquement à l’enregistrement."
      />
      {error ? (
        <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          {error}
        </div>
      ) : null}
      <form action={createRepairAction} className="surface grid gap-5 p-5 lg:grid-cols-2">
        <label>
          <span className="field-label">Client</span>
          <select className="field-input" name="customerId" required>
            <option value="">Choisir un client</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.fullName} · {customer.phone}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Véhicule</span>
          <select className="field-input" name="vehicleId">
            <option value="">Sans véhicule précis</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.customer.fullName} · {vehicle.brand} {vehicle.model}
                {vehicle.licensePlate ? ` · ${vehicle.licensePlate}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Technicien assigné</span>
          <select className="field-input" name="technicianId">
            <option value="">Non assigné</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Statut initial</span>
          <select className="field-input" name="status" defaultValue="RECEPTION">
            {Object.entries(repairStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="lg:col-span-2">
          <span className="field-label">Problème ou demande client</span>
          <textarea className="field-input min-h-28" name="issue" required />
        </label>
        <label>
          <span className="field-label">Prix estimé en MAD</span>
          <input className="field-input" name="estimatedPrice" step="0.01" type="number" />
        </label>
        <label>
          <span className="field-label">Date estimée de fin</span>
          <input className="field-input" name="estimatedCompletion" type="date" />
        </label>
        <label>
          <span className="field-label">Notes client</span>
          <textarea className="field-input min-h-24" name="customerNotes" />
        </label>
        <label>
          <span className="field-label">Notes internes</span>
          <textarea className="field-input min-h-24" name="internalNotes" />
        </label>
        <div className="lg:col-span-2">
          <PendingButton>Créer la réparation</PendingButton>
        </div>
      </form>
    </>
  );
}
