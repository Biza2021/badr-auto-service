import { KeyRound, Plus, UserCog } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { PendingButton } from "@/components/pending-button";
import {
  createTechnicianAction,
  resetTechnicianPasswordAction,
  toggleTechnicianActiveAction,
  updateTechnicianAction
} from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function technicianStatusLabel(isActive: boolean) {
  return isActive ? "Actif" : "Inactif";
}

function technicianStatusClass(isActive: boolean) {
  return isActive
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : "bg-rose-50 text-rose-700 ring-rose-200";
}

export default async function TechniciansPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const success = typeof params.succes === "string" ? params.succes : null;
  const error = typeof params.erreur === "string" ? params.erreur : null;
  const technicians = await prisma.user.findMany({
    where: { role: "TECHNICIAN" },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      _count: { select: { repairs: true } }
    }
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Équipe"
        title="Techniciens"
        text="Créez les comptes techniciens, gérez leur accès mobile et assignez les réparations aux bonnes personnes."
      />

      {success ? (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Modifications enregistrées.
        </div>
      ) : null}
      {error ? (
        <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="grid gap-4">
          {technicians.length === 0 ? (
            <div className="surface p-5">
              <EmptyState
                title="Aucun technicien"
                text="Ajoutez un premier technicien pour lui donner accès à l’espace mobile."
              />
            </div>
          ) : (
            technicians.map((technician) => (
              <article className="surface overflow-hidden" key={technician.id}>
                <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-navy">{technician.name}</h2>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${technicianStatusClass(
                          technician.isActive
                        )}`}
                      >
                        {technicianStatusLabel(technician.isActive)}
                      </span>
                    </div>
                    <p className="mt-1 break-all text-sm text-slate-600">{technician.email}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {technician.phone ?? "Téléphone non renseigné"} · Créé le {formatDate(technician.createdAt)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {technician._count.repairs} réparation{technician._count.repairs > 1 ? "s" : ""} assignée
                      {technician._count.repairs > 1 ? "s" : ""}
                    </p>
                  </div>
                  <form action={toggleTechnicianActiveAction.bind(null, technician.id)}>
                    <button className="btn-secondary w-full sm:w-auto" type="submit">
                      {technician.isActive ? "Désactiver" : "Activer"}
                    </button>
                  </form>
                </div>

                <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_0.8fr]">
                  <form action={updateTechnicianAction.bind(null, technician.id)} className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="field-label">Nom complet</span>
                      <input className="field-input" name="name" required defaultValue={technician.name} />
                    </label>
                    <label>
                      <span className="field-label">Email</span>
                      <input className="field-input" name="email" required type="email" defaultValue={technician.email} />
                    </label>
                    <label>
                      <span className="field-label">Téléphone</span>
                      <input className="field-input" name="phone" type="tel" defaultValue={technician.phone ?? ""} />
                    </label>
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3">
                      <input
                        className="h-5 w-5 rounded border-slate-300 text-accent focus:ring-orange-100"
                        name="isActive"
                        type="checkbox"
                        defaultChecked={technician.isActive}
                      />
                      <span className="text-sm font-bold text-slate-800">Actif</span>
                    </label>
                    <div className="sm:col-span-2">
                      <PendingButton>Modifier</PendingButton>
                    </div>
                  </form>

                  <form action={resetTechnicianPasswordAction.bind(null, technician.id)} className="rounded-lg bg-mist p-4">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-accent" aria-hidden="true" />
                      <h3 className="font-bold text-navy">Réinitialiser le mot de passe</h3>
                    </div>
                    <label className="mt-4 block">
                      <span className="field-label">Nouveau mot de passe</span>
                      <input className="field-input" name="password" required minLength={6} type="password" />
                    </label>
                    <button className="btn-dark mt-4 w-full" type="submit">
                      Réinitialiser le mot de passe
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}
        </section>

        <aside className="surface p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-accent">
              <UserCog className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-bold text-navy">Ajouter un technicien</h2>
              <p className="text-sm text-slate-600">Compte mobile pour l’atelier.</p>
            </div>
          </div>
          <form action={createTechnicianAction} className="mt-5 grid gap-4">
            <label>
              <span className="field-label">Nom complet</span>
              <input className="field-input" name="name" required />
            </label>
            <label>
              <span className="field-label">Email</span>
              <input className="field-input" name="email" required type="email" />
            </label>
            <label>
              <span className="field-label">Téléphone</span>
              <input className="field-input" name="phone" type="tel" />
            </label>
            <label>
              <span className="field-label">Mot de passe</span>
              <input className="field-input" name="password" required minLength={6} type="password" />
            </label>
            <PendingButton>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Ajouter un technicien
            </PendingButton>
          </form>
        </aside>
      </div>
    </>
  );
}
