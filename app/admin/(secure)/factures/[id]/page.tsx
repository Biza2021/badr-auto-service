import { Download, Mail, Printer } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin-page-header";
import { PendingButton } from "@/components/pending-button";
import { StatusBadge } from "@/components/status-badge";
import { updatePaymentStatusAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { invoiceLineTypeLabels, paymentStatusLabels } from "@/lib/status";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function InvoiceDetailPage({
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
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      repair: { include: { vehicle: true } },
      lines: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!invoice) notFound();

  return (
    <>
      <AdminPageHeader
        eyebrow="Facture"
        title={invoice.invoiceNumber}
        text={`${invoice.customer.fullName} · ${invoice.repair.trackingCode}`}
        action={
          <>
            <button className="btn-secondary" type="button">
              <Download className="h-4 w-4" aria-hidden="true" />
              Télécharger PDF
            </button>
            <button className="btn-secondary" type="button">
              <Printer className="h-4 w-4" aria-hidden="true" />
              Imprimer
            </button>
            <button className="btn-primary" type="button">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Envoyer au client
            </button>
          </>
        }
      />
      {success ? (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Paiement mis à jour.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="surface overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Client</p>
                <h2 className="mt-1 text-2xl font-bold text-navy">{invoice.customer.fullName}</h2>
                <p className="mt-2 text-sm text-slate-600">{invoice.customer.phone}</p>
              </div>
              <StatusBadge label={paymentStatusLabels[invoice.status]} status={invoice.status} />
            </div>
          </div>
          <div className="overflow-x-auto sm:overflow-visible">
            <table className="mobile-card-table min-w-[720px] sm:min-w-0">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Quantité</th>
                  <th className="px-5 py-3">Prix unitaire</th>
                  <th className="px-5 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.lines.map((line) => (
                  <tr key={line.id}>
                    <td data-label="Type" className="px-5 py-4">{invoiceLineTypeLabels[line.type]}</td>
                    <td data-label="Description" className="px-5 py-4 font-semibold text-slate-800">{line.description}</td>
                    <td data-label="Quantité" className="px-5 py-4">{line.quantity}</td>
                    <td data-label="Prix unitaire" className="px-5 py-4">{formatMoney(line.unitPrice)}</td>
                    <td data-label="Total" className="px-5 py-4 font-bold text-navy">
                      {formatMoney(Number(line.unitPrice.toString()) * line.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 p-5">
            <div className="ml-auto max-w-sm space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-600">Total</span>
                <span className="font-bold text-navy">{formatMoney(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-600">Payé</span>
                <span className="font-bold text-navy">{formatMoney(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
                <span className="font-semibold text-slate-700">Reste</span>
                <span className="font-bold text-accent">
                  {formatMoney(Number(invoice.totalAmount.toString()) - Number(invoice.paidAmount.toString()))}
                </span>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="surface p-5">
            <h2 className="font-bold text-navy">Paiement</h2>
            <form action={updatePaymentStatusAction.bind(null, invoice.id)} className="mt-5 grid gap-4">
              <label>
                <span className="field-label">Statut</span>
                <select className="field-input" name="status" defaultValue={invoice.status}>
                  {Object.entries(paymentStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-label">Montant payé</span>
                <input
                  className="field-input"
                  name="paidAmount"
                  step="0.01"
                  type="number"
                  defaultValue={invoice.paidAmount.toString()}
                />
              </label>
              <PendingButton>Mettre à jour</PendingButton>
            </form>
          </section>
          <section className="surface p-5">
            <h2 className="font-bold text-navy">Dossier lié</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">Réparation</dt>
                <dd className="mt-1 font-bold text-navy">{invoice.repair.trackingCode}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Véhicule</dt>
                <dd className="mt-1">
                  {invoice.repair.vehicle
                    ? `${invoice.repair.vehicle.brand} ${invoice.repair.vehicle.model}`
                    : "Non renseigné"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Date facture</dt>
                <dd className="mt-1">{formatDate(invoice.createdAt)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}
