import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, MessageCircle, Search, Wrench } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ImagePanel } from "@/components/image-panel";
import { PublicShell } from "@/components/public-header";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { repairStatusLabels, repairTimeline } from "@/lib/status";

export const metadata: Metadata = {
  title: "Suivi réparation"
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TrackingPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const code = typeof params.code === "string" ? params.code.trim().toUpperCase() : "";
  const repair = code
    ? await prisma.repair.findUnique({
        where: { trackingCode: code },
        include: {
          customer: true,
          vehicle: true
        }
      })
    : null;

  const activeIndex = repair ? repairTimeline.indexOf(repair.status) : -1;

  return (
    <PublicShell>
      <main className="bg-mist">
        <section className="bg-white py-14">
          <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-accent">Suivi réparation</p>
              <h1 className="mt-2 text-4xl font-bold text-navy">Suivre l’avancement de votre véhicule</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Entrez le code de suivi remis par le garage. La page affiche uniquement les informations
                liées à ce code.
              </p>
              <form className="mt-7 flex flex-col gap-3 sm:flex-row" action="/suivi">
                <label className="sr-only" htmlFor="code">
                  Code de suivi
                </label>
                <input
                  className="field-input mt-0 sm:max-w-sm"
                  defaultValue={code}
                  id="code"
                  name="code"
                  placeholder="Ex. BAS-2026-1842"
                />
                <button className="btn-primary" type="submit">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Rechercher
                </button>
              </form>
            </div>
            <ImagePanel
              src="/images/admin/06-customer-repair-tracking-ui-badr-auto-service.png"
              alt="Suivi de réparation avec code client"
              className="min-h-[330px]"
              priority
            />
          </div>
        </section>

        <section className="py-14">
          <div className="container-page">
            {!code ? (
              <EmptyState
                title="Aucun code saisi"
                text="Saisissez votre code de suivi pour consulter l’état de la réparation."
              />
            ) : !repair ? (
              <EmptyState
                title="Code introuvable"
                text="Vérifiez le code reçu du garage ou contactez l’équipe pour confirmer votre dossier."
              />
            ) : (
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <section className="surface p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Code de suivi</p>
                      <h2 className="mt-1 text-2xl font-bold text-navy">{repair.trackingCode}</h2>
                    </div>
                    <StatusBadge label={repairStatusLabels[repair.status]} status={repair.status} />
                  </div>
                  <dl className="mt-6 grid gap-4 text-sm">
                    <div>
                      <dt className="font-semibold text-slate-500">Client</dt>
                      <dd className="mt-1 font-bold text-slate-900">{repair.customer.fullName}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500">Véhicule</dt>
                      <dd className="mt-1 font-bold text-slate-900">
                        {repair.vehicle
                          ? `${repair.vehicle.brand} ${repair.vehicle.model}`
                          : "Véhicule non renseigné"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500">Problème signalé</dt>
                      <dd className="mt-1 leading-6 text-slate-700">{repair.issue}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500">Fin estimée</dt>
                      <dd className="mt-1 font-bold text-slate-900">
                        {formatDate(repair.estimatedCompletion)}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    className="btn-dark mt-6"
                    href="https://wa.me/212661248730"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Contacter le garage
                  </Link>
                </section>
                <section className="surface p-6">
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="h-6 w-6 text-accent" aria-hidden="true" />
                    <h2 className="text-xl font-bold text-navy">Progression</h2>
                  </div>
                  <ol className="mt-6 space-y-4">
                    {repair.status === "ANNULE" ? (
                      <li className="flex gap-3">
                        <span className="mt-1 h-3 w-3 rounded-full bg-rose-500" />
                        <div>
                          <p className="font-semibold text-rose-700">Réparation annulée</p>
                          <p className="text-sm text-slate-600">
                            Contactez le garage pour connaître la raison ou la suite possible.
                          </p>
                        </div>
                      </li>
                    ) : (
                      repairTimeline.map((status, index) => {
                        const done = index <= activeIndex;
                        return (
                          <li className="flex gap-3" key={status}>
                            <span
                              className={`mt-1 h-3 w-3 rounded-full ${
                                done ? "bg-accent" : "bg-slate-300"
                              }`}
                            />
                            <div>
                              <p className={done ? "font-semibold text-navy" : "font-semibold text-slate-500"}>
                                {repairStatusLabels[status]}
                              </p>
                              {status === repair.status ? (
                                <p className="text-sm text-slate-600">
                                  Étape actuelle du dossier.
                                </p>
                              ) : null}
                            </div>
                          </li>
                        );
                      })
                    )}
                  </ol>
                </section>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 text-accent">
                <Wrench className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-navy">Un suivi pensé pour rester clair</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Le suivi ne remplace pas l’échange avec l’équipe. Il sert à donner une vision simple du
                statut, de l’avancement et de la date estimée quand elle est disponible.
              </p>
            </div>
            <ImagePanel
              src="/images/customer/11-repair-documentation-badr-auto-service.png"
              alt="Documentation du suivi de réparation"
              className="min-h-[300px]"
            />
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
