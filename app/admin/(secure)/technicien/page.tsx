import { CheckCircle2, ClipboardCheck, Smartphone } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { markReadyAction, technicianStatusAction } from "@/app/admin/actions";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { repairStatusLabels } from "@/lib/status";

export default async function TechnicianPage() {
  const user = await getCurrentUser();
  const repairs = await prisma.repair.findMany({
    where:
      user?.role === "TECHNICIAN"
        ? {
            technicianId: user.id,
            status: { notIn: ["LIVRE", "ANNULE"] }
          }
        : {
            status: { notIn: ["LIVRE", "ANNULE"] }
          },
    orderBy: [{ estimatedCompletion: "asc" }, { updatedAt: "desc" }],
    include: { customer: true, vehicle: true, technician: true }
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Technicien"
        title="Travail du jour"
        text="Une vue rapide pour lire les dossiers assignés, changer un statut et marquer un véhicule prêt depuis le téléphone."
      />

      <section className="mx-auto max-w-xl space-y-4">
        {repairs.length === 0 ? (
          <EmptyState title="Aucune réparation assignée" text="Les dossiers actifs assignés apparaîtront ici." />
        ) : (
          repairs.map((repair) => (
            <article className="surface overflow-hidden" key={repair.id}>
              <div className="bg-navy p-4 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-orange-100">{repair.trackingCode}</p>
                    <h2 className="mt-1 text-xl font-bold leading-tight">{repair.customer.fullName}</h2>
                  </div>
                  <Smartphone className="h-5 w-5 text-orange-200" aria-hidden="true" />
                </div>
                <p className="mt-2 text-sm font-medium text-slate-200">
                  {repair.vehicle ? `${repair.vehicle.brand} ${repair.vehicle.model}` : "Véhicule non renseigné"}
                </p>
              </div>
              <div className="p-4">
                <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
                  <StatusBadge label={repairStatusLabels[repair.status]} status={repair.status} />
                  <p className="text-sm font-semibold text-slate-600">
                    Fin estimée : {formatDate(repair.estimatedCompletion)}
                  </p>
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-bold text-navy">Problème</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{repair.issue}</p>
                </div>
                <div className="mt-4 grid gap-2 text-sm">
                  {["Diagnostic consulté", "Pièces vérifiées", "Notes ajoutées si besoin", "Contrôle qualité prévu"].map(
                    (item) => (
                      <div className="flex items-center gap-2" key={item}>
                        <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" />
                        <span className="font-medium text-slate-700">{item}</span>
                      </div>
                    )
                  )}
                </div>
                {repair.internalNotes ? (
                  <div className="mt-4 rounded-lg border border-slate-200 p-4">
                    <p className="text-sm font-bold text-navy">Notes internes</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{repair.internalNotes}</p>
                  </div>
                ) : null}
                <form action={technicianStatusAction.bind(null, repair.id)} className="mt-4 grid gap-3">
                  <label>
                    <span className="field-label">Mettre à jour le statut</span>
                    <select className="field-input" name="status" defaultValue={repair.status}>
                      {Object.entries(repairStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="btn-secondary w-full" type="submit">
                    <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                    Mettre à jour
                  </button>
                </form>
                <form action={markReadyAction.bind(null, repair.id)} className="mt-3">
                  <button className="btn-primary w-full" type="submit">
                    Marquer comme prêt
                  </button>
                </form>
              </div>
            </article>
          ))
        )}
      </section>
    </>
  );
}
