import Link from "next/link";
import { CheckCircle2, ExternalLink, PackageCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin-page-header";
import { PendingButton } from "@/components/pending-button";
import { StatusBadge } from "@/components/status-badge";
import { markRepairDeliveredAction, updateRepairAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { displayStaffName } from "@/lib/display";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { repairStatusLabels } from "@/lib/status";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RepairDetailPage({
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
  const error = typeof query.erreur === "string" ? query.erreur : null;
  const repair = await prisma.repair.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      technician: true,
      invoice: true,
      activities: { orderBy: { createdAt: "desc" }, take: 8, include: { user: true } }
    }
  });

  if (!repair) notFound();

  const technicians = await prisma.user.findMany({
    where: {
      role: "TECHNICIAN",
      OR: [{ isActive: true }, ...(repair.technicianId ? [{ id: repair.technicianId }] : [])]
    },
    orderBy: { name: "asc" }
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Dossier réparation"
        title={repair.trackingCode}
        text={`${repair.customer.fullName} · ${
          repair.vehicle ? `${repair.vehicle.brand} ${repair.vehicle.model}` : "Véhicule non renseigné"
        }`}
        action={
          <>
            <Link className="btn-secondary" href={`/suivi?code=${repair.trackingCode}`} target="_blank">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Voir le suivi client
            </Link>
            <form action={markRepairDeliveredAction.bind(null, repair.id)}>
              <button className="btn-dark" type="submit">
                <PackageCheck className="h-4 w-4" aria-hidden="true" />
                Marquer livré
              </button>
            </form>
          </>
        }
      />
      {success ? (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="mr-2 inline h-5 w-5" aria-hidden="true" />
          Modifications enregistrées.
        </div>
      ) : null}
      {error ? (
        <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <form action={updateRepairAction.bind(null, repair.id)} className="surface grid gap-5 p-5 lg:grid-cols-2">
          <label>
            <span className="field-label">Statut</span>
            <select className="field-input" name="status" defaultValue={repair.status}>
              {Object.entries(repairStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Technicien assigné</span>
            <select className="field-input" name="technicianId" defaultValue={repair.technicianId ?? ""}>
              <option value="">Non assigné</option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.name}
                  {technician.isActive ? "" : " · Inactif"}
                </option>
              ))}
            </select>
          </label>
          <label className="lg:col-span-2">
            <span className="field-label">Problème ou demande client</span>
            <textarea className="field-input min-h-28" name="issue" required defaultValue={repair.issue} />
          </label>
          <label>
            <span className="field-label">Prix estimé en MAD</span>
            <input
              className="field-input"
              defaultValue={repair.estimatedPrice?.toString() ?? ""}
              name="estimatedPrice"
              step="0.01"
              type="number"
            />
          </label>
          <label>
            <span className="field-label">Date estimée de fin</span>
            <input
              className="field-input"
              defaultValue={repair.estimatedCompletion?.toISOString().slice(0, 10) ?? ""}
              name="estimatedCompletion"
              type="date"
            />
          </label>
          <label>
            <span className="field-label">Notes client</span>
            <textarea className="field-input min-h-24" name="customerNotes" defaultValue={repair.customerNotes ?? ""} />
          </label>
          <label>
            <span className="field-label">Notes internes</span>
            <textarea className="field-input min-h-24" name="internalNotes" defaultValue={repair.internalNotes ?? ""} />
          </label>
          <div className="lg:col-span-2">
            <PendingButton>Enregistrer</PendingButton>
          </div>
        </form>

        <aside className="space-y-6">
          <section className="surface p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold text-navy">Résumé</h2>
              <StatusBadge label={repairStatusLabels[repair.status]} status={repair.status} />
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">Client</dt>
                <dd className="mt-1 font-bold text-slate-900">{repair.customer.fullName}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Téléphone</dt>
                <dd className="mt-1">{repair.customer.phone}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Prix estimé</dt>
                <dd className="mt-1 font-bold text-slate-900">{formatMoney(repair.estimatedPrice)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Fin estimée</dt>
                <dd className="mt-1">{formatDate(repair.estimatedCompletion)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Créé le</dt>
                <dd className="mt-1">{formatDateTime(repair.createdAt)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Facture</dt>
                <dd className="mt-1">
                  {repair.invoice ? (
                    <Link className="font-semibold text-accent" href={`/admin/factures/${repair.invoice.id}`}>
                      Ouvrir la facture
                    </Link>
                  ) : (
                    <Link className="font-semibold text-accent" href="/admin/factures">
                      Créer une facture
                    </Link>
                  )}
                </dd>
              </div>
            </dl>
          </section>
          <section className="surface p-5">
            <h2 className="font-bold text-navy">Historique récent</h2>
            <div className="mt-4 space-y-4">
              {repair.activities.length === 0 ? (
                <p className="text-sm text-slate-600">Aucune activité enregistrée.</p>
              ) : (
                repair.activities.map((activity) => (
                  <div key={activity.id}>
                    <p className="text-sm font-semibold text-slate-800">{activity.message}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {activity.user ? displayStaffName(activity.user.name) : "Système"} · {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
