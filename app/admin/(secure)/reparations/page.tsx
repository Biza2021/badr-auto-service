import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { repairStatusLabels } from "@/lib/status";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RepairsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.statut === "string" ? params.statut : "";
  const repairs = await prisma.repair.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { trackingCode: { contains: q, mode: "insensitive" } },
                { issue: { contains: q, mode: "insensitive" } },
                { customer: { fullName: { contains: q, mode: "insensitive" } } },
                { vehicle: { brand: { contains: q, mode: "insensitive" } } },
                { vehicle: { model: { contains: q, mode: "insensitive" } } }
              ]
            }
          : {},
        status ? { status: status as never } : {}
      ]
    },
    orderBy: { updatedAt: "desc" },
    include: { customer: true, vehicle: true, technician: true }
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Réparations"
        title="Gestion des dossiers atelier"
        text="Créez les réparations, mettez à jour les statuts et gardez un suivi exploitable pour le client."
        action={
          <Link className="btn-primary" href="/admin/reparations/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Créer une réparation
          </Link>
        }
      />

      <section className="surface mb-6 overflow-hidden">
        <div className="relative h-36 bg-slate-200 sm:h-48">
          <Image
            src="/images/admin/08-repair-management-page-badr-auto-service.png"
            alt="Gestion des réparations Badr Auto Service"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <form className="grid gap-3 border-t border-slate-200 p-4 md:grid-cols-[1fr_240px_auto]">
          <label>
            <span className="field-label">Recherche</span>
            <input
              className="field-input"
              defaultValue={q}
              name="q"
              placeholder="Code, client, véhicule ou problème"
            />
          </label>
          <label>
            <span className="field-label">Statut</span>
            <select className="field-input" defaultValue={status} name="statut">
              <option value="">Tous les statuts</option>
              {Object.entries(repairStatusLabels).map(([value, label]) => (
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

      <section className="surface overflow-hidden">
        {repairs.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Aucune réparation trouvée" text="Ajustez les filtres ou créez un nouveau dossier." />
          </div>
        ) : (
          <div className="overflow-x-auto sm:overflow-visible">
            <table className="mobile-card-table min-w-[980px] sm:min-w-0">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Véhicule</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Technicien</th>
                  <th className="px-5 py-3">Prix estimé</th>
                  <th className="px-5 py-3">Fin estimée</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {repairs.map((repair) => (
                  <tr key={repair.id}>
                    <td data-label="Code" className="px-5 py-4 font-bold text-navy">{repair.trackingCode}</td>
                    <td data-label="Client" className="px-5 py-4">{repair.customer.fullName}</td>
                    <td data-label="Véhicule" className="px-5 py-4">
                      {repair.vehicle ? `${repair.vehicle.brand} ${repair.vehicle.model}` : "Non renseigné"}
                    </td>
                    <td data-label="Statut" className="px-5 py-4">
                      <StatusBadge label={repairStatusLabels[repair.status]} status={repair.status} />
                    </td>
                    <td data-label="Technicien" className="px-5 py-4">{repair.technician?.name ?? "Non assigné"}</td>
                    <td data-label="Prix estimé" className="px-5 py-4">{formatMoney(repair.estimatedPrice)}</td>
                    <td data-label="Fin estimée" className="px-5 py-4">{formatDate(repair.estimatedCompletion)}</td>
                    <td data-label="Action" className="px-5 py-4">
                      <Link className="font-semibold text-accent hover:text-orange-700" href={`/admin/reparations/${repair.id}`}>
                        Détails
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
