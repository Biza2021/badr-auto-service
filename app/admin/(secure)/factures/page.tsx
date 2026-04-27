import Image from "next/image";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { PendingButton } from "@/components/pending-button";
import { StatusBadge } from "@/components/status-badge";
import { createInvoiceAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { paymentStatusLabels } from "@/lib/status";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function InvoicesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const error = typeof params.erreur === "string" ? params.erreur : null;
  const [invoices, repairs] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: true, repair: true }
    }),
    prisma.repair.findMany({
      where: { invoice: null },
      orderBy: { updatedAt: "desc" },
      include: { customer: true, vehicle: true }
    })
  ]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Factures"
        title="Facturation et paiements"
        text="Créez une facture depuis une réparation, ajoutez les lignes et suivez le paiement en MAD."
      />
      {error ? (
        <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          {error}
        </div>
      ) : null}

      <section className="surface mb-6 overflow-hidden">
        <div className="relative h-36 bg-slate-200 sm:h-48">
          <Image
            src="/images/admin/13-invoice-payment-ui-badr-auto-service.png"
            alt="Factures et paiements Badr Auto Service"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="surface overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Aucune facture" text="Créez une facture depuis une réparation terminée ou en cours." />
            </div>
          ) : (
            <div className="overflow-x-auto sm:overflow-visible">
              <table className="mobile-card-table min-w-[840px] sm:min-w-0">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Numéro</th>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Réparation</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Paiement</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td data-label="Numéro" className="px-5 py-4 font-bold text-navy">{invoice.invoiceNumber}</td>
                      <td data-label="Client" className="px-5 py-4">{invoice.customer.fullName}</td>
                      <td data-label="Réparation" className="px-5 py-4">{invoice.repair.trackingCode}</td>
                      <td data-label="Total" className="px-5 py-4 font-semibold">{formatMoney(invoice.totalAmount)}</td>
                      <td data-label="Paiement" className="px-5 py-4">
                        <StatusBadge label={paymentStatusLabels[invoice.status]} status={invoice.status} />
                      </td>
                      <td data-label="Date" className="px-5 py-4">{formatDate(invoice.createdAt)}</td>
                      <td data-label="Action" className="px-5 py-4">
                        <Link className="font-semibold text-accent" href={`/admin/factures/${invoice.id}`}>
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
            <FilePlus2 className="h-5 w-5 text-accent" aria-hidden="true" />
            <h2 className="font-bold text-navy">Créer une facture</h2>
          </div>
          <form action={createInvoiceAction} className="mt-5 grid gap-4">
            <label>
              <span className="field-label">Réparation</span>
              <select className="field-input" name="repairId" required>
                <option value="">Choisir une réparation</option>
                {repairs.map((repair) => (
                  <option key={repair.id} value={repair.id}>
                    {repair.trackingCode} · {repair.customer.fullName}
                    {repair.vehicle ? ` · ${repair.vehicle.brand} ${repair.vehicle.model}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="font-semibold text-navy">Service</p>
              <label className="mt-3 block">
                <span className="field-label">Description</span>
                <input className="field-input" name="serviceDescription" defaultValue="Service atelier" />
              </label>
              <label className="mt-3 block">
                <span className="field-label">Montant MAD</span>
                <input className="field-input" name="servicePrice" step="0.01" type="number" />
              </label>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="font-semibold text-navy">Pièces</p>
              <label className="mt-3 block">
                <span className="field-label">Description</span>
                <input className="field-input" name="partDescription" defaultValue="Pièces de rechange" />
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="field-label">Quantité</span>
                  <input className="field-input" name="partQuantity" type="number" defaultValue="1" min="1" />
                </label>
                <label>
                  <span className="field-label">Prix unitaire MAD</span>
                  <input className="field-input" name="partPrice" step="0.01" type="number" />
                </label>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="font-semibold text-navy">Main-d’œuvre</p>
              <label className="mt-3 block">
                <span className="field-label">Description</span>
                <input className="field-input" name="laborDescription" defaultValue="Main-d’œuvre" />
              </label>
              <label className="mt-3 block">
                <span className="field-label">Montant MAD</span>
                <input className="field-input" name="laborPrice" step="0.01" type="number" />
              </label>
            </div>
            <label>
              <span className="field-label">Montant déjà payé</span>
              <input className="field-input" name="paidAmount" step="0.01" type="number" defaultValue="0" />
            </label>
            <label>
              <span className="field-label">Statut paiement</span>
              <select className="field-input" name="status" defaultValue="NON_PAYE">
                {Object.entries(paymentStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <PendingButton>Créer la facture</PendingButton>
          </form>
        </section>
      </div>
    </>
  );
}
