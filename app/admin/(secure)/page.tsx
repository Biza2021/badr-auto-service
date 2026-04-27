import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, ClipboardList, Plus, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { displayStaffName } from "@/lib/display";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { appointmentStatusLabels, repairStatusLabels } from "@/lib/status";

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    activeRepairs,
    readyForPickup,
    upcomingAppointments,
    newCustomers,
    recentRepairs,
    todaysAppointments,
    activities
  ] = await Promise.all([
    prisma.repair.count({
      where: {
        status: {
          notIn: ["LIVRE", "ANNULE"]
        }
      }
    }),
    prisma.repair.count({ where: { status: "PRET_A_RECUPERER" } }),
    prisma.appointment.count({
      where: {
        desiredDateTime: { gte: now },
        status: { notIn: ["TERMINE", "ANNULE"] }
      }
    }),
    prisma.customer.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.repair.findMany({
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: { customer: true, vehicle: true }
    }),
    prisma.appointment.findMany({
      where: { desiredDateTime: { gte: startOfToday, lte: endOfToday } },
      orderBy: { desiredDateTime: "asc" },
      take: 6
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 7,
      include: { user: true }
    })
  ]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Tableau de bord"
        title="Vue atelier"
        text="Suivez les réparations actives, les rendez-vous du jour et les derniers mouvements du garage."
        action={
          <>
            <Link className="btn-secondary" href="/admin/rendez-vous">
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              Rendez-vous
            </Link>
            <Link className="btn-primary" href="/admin/reparations/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nouvelle réparation
            </Link>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Réparations actives" value={activeRepairs} hint="Hors dossiers livrés ou annulés" />
        <StatCard label="Prêtes à récupérer" value={readyForPickup} hint="À prévenir ou remettre au client" />
        <StatCard label="Rendez-vous à venir" value={upcomingAppointments} hint="Confirmés ou en attente" />
        <StatCard label="Nouveaux clients ce mois" value={newCustomers} hint="Créés depuis le début du mois" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="font-bold text-navy">Réparations récentes</h2>
            </div>
            <Link className="text-sm font-semibold text-accent hover:text-orange-700" href="/admin/reparations">
              Voir tout
            </Link>
          </div>
          {recentRepairs.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Aucune réparation" text="Les nouveaux dossiers apparaîtront ici." />
            </div>
          ) : (
            <div className="overflow-x-auto sm:overflow-visible">
              <table className="mobile-card-table min-w-[720px] sm:min-w-0">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Véhicule</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRepairs.map((repair) => (
                    <tr key={repair.id}>
                      <td data-label="Code" className="px-5 py-4 font-semibold text-navy">{repair.trackingCode}</td>
                      <td data-label="Client" className="px-5 py-4">{repair.customer.fullName}</td>
                      <td data-label="Véhicule" className="px-5 py-4">
                        {repair.vehicle ? `${repair.vehicle.brand} ${repair.vehicle.model}` : "Non renseigné"}
                      </td>
                      <td data-label="Statut" className="px-5 py-4">
                        <StatusBadge label={repairStatusLabels[repair.status]} status={repair.status} />
                      </td>
                      <td data-label="Action" className="px-5 py-4">
                        <Link
                          className="font-semibold text-accent hover:text-orange-700"
                          href={`/admin/reparations/${repair.id}`}
                        >
                          Ouvrir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="surface overflow-hidden">
          <div className="relative h-44 bg-slate-200">
            <Image
              src="/images/admin/07-admin-dashboard-overview-badr-auto-service.png"
              alt="Aperçu tableau de bord Badr Auto Service"
              fill
              sizes="(min-width: 1280px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="font-bold text-navy">Activité récente</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {activities.length === 0 ? (
              <div className="p-5">
                <EmptyState title="Aucune activité" text="Les actions importantes seront listées ici." />
              </div>
            ) : (
              activities.map((activity) => (
                <div className="px-5 py-4" key={activity.id}>
                  <p className="text-sm font-semibold text-slate-800">{activity.message}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {activity.user ? displayStaffName(activity.user.name) : "Système"} · {formatDateTime(activity.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold text-navy">Rendez-vous du jour</h2>
          <Link className="text-sm font-semibold text-accent hover:text-orange-700" href="/admin/rendez-vous">
            Gérer
          </Link>
        </div>
        {todaysAppointments.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Aucun rendez-vous aujourd’hui" text="Les rendez-vous du jour apparaîtront ici." />
          </div>
        ) : (
          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
            {todaysAppointments.map((appointment) => (
              <div className="rounded-lg border border-slate-200 bg-white p-4" key={appointment.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-navy">{appointment.fullName}</p>
                    <p className="mt-1 text-sm text-slate-600">{appointment.vehicleText}</p>
                  </div>
                  <StatusBadge
                    label={appointmentStatusLabels[appointment.status]}
                    status={appointment.status}
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  {formatDateTime(appointment.desiredDateTime)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
