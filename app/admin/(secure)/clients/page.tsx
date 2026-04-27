import Image from "next/image";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { PendingButton } from "@/components/pending-button";
import { createCustomerAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { vehicles: { some: { licensePlate: { contains: q, mode: "insensitive" } } } }
          ]
        }
      : {},
    orderBy: { updatedAt: "desc" },
    include: {
      vehicles: true,
      repairs: { select: { id: true } }
    }
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Clients"
        title="Gestion des clients"
        text="Retrouvez les coordonnées, les véhicules et l’historique de chaque client du garage."
      />

      <section className="surface mb-6 overflow-hidden">
        <div className="relative h-36 bg-slate-200 sm:h-48">
          <Image
            src="/images/admin/09-customer-management-page-badr-auto-service.png"
            alt="Gestion des clients Badr Auto Service"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <form className="grid gap-3 border-t border-slate-200 p-4 md:grid-cols-[1fr_auto]">
          <label>
            <span className="field-label">Recherche client</span>
            <input
              className="field-input"
              defaultValue={q}
              name="q"
              placeholder="Nom, téléphone ou matricule"
            />
          </label>
          <div className="flex items-end">
            <button className="btn-dark w-full" type="submit">
              <Search className="h-4 w-4" aria-hidden="true" />
              Rechercher
            </button>
          </div>
        </form>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="surface overflow-hidden">
          {customers.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Aucun client trouvé" text="Créez une fiche client ou ajustez la recherche." />
            </div>
          ) : (
            <div className="overflow-x-auto sm:overflow-visible">
              <table className="mobile-card-table min-w-[780px] sm:min-w-0">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Téléphone</th>
                    <th className="px-5 py-3">Véhicules</th>
                    <th className="px-5 py-3">Réparations</th>
                    <th className="px-5 py-3">Créé le</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td data-label="Client" className="px-5 py-4 font-bold text-navy">{customer.fullName}</td>
                      <td data-label="Téléphone" className="px-5 py-4">{customer.phone}</td>
                      <td data-label="Véhicules" className="px-5 py-4">{customer.vehicles.length}</td>
                      <td data-label="Réparations" className="px-5 py-4">{customer.repairs.length}</td>
                      <td data-label="Créé le" className="px-5 py-4">{formatDate(customer.createdAt)}</td>
                      <td data-label="Action" className="px-5 py-4">
                        <Link className="font-semibold text-accent hover:text-orange-700" href={`/admin/clients/${customer.id}`}>
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

        <section className="surface p-5">
          <div className="flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-accent" aria-hidden="true" />
            <h2 className="font-bold text-navy">Nouveau client</h2>
          </div>
          <form action={createCustomerAction} className="mt-5 grid gap-4">
            <label>
              <span className="field-label">Nom complet</span>
              <input className="field-input" name="fullName" required />
            </label>
            <label>
              <span className="field-label">Téléphone</span>
              <input className="field-input" name="phone" required type="tel" />
            </label>
            <label>
              <span className="field-label">E-mail</span>
              <input className="field-input" name="email" type="email" />
            </label>
            <label>
              <span className="field-label">Notes</span>
              <textarea className="field-input min-h-24" name="notes" />
            </label>
            <PendingButton>Créer le client</PendingButton>
          </form>
        </section>
      </div>
    </>
  );
}
